import socketIOClient from "socket.io-client";
import {action, makeAutoObservable} from "mobx";
import {Actions, Page, Player} from "../modules/types";

export class Socket {
    socket = socketIOClient("http://localhost:3001",{
        withCredentials: true
    });


    isFirst = true;
    gameCode = "";
    currentPage: Page = Page.Home;
    id = "";
    isPlaying = false;
    isCurrentPlayer = false;
    table: string[] = [];

    player: Player = {};
    opponent: Player = {};

    opponentTimer = false;
    playerTimer = false;
    turnTime = -1;
    currentBank = 0;

    message = "";

    actions: Actions = {
        call: false,
        raise: false,
        check: false,
        fold: false,
        allin: false,
    };

    constructor() {
        //this.socket.on("init", this.handleInit.bind(this));
        this.socket.on("gameCode", this.handleCreated.bind(this));
        this.socket.on("prepare", this.handlePrepare.bind(this));
        //this.socket.on("changeStack", this.handleChangeStack.bind(this));
        this.socket.on("getCards",this.handleGetCards.bind(this));
        this.socket.on("turnOptions",this.handleTurnOptions.bind(this));
        this.socket.on("infoUpdate",this.handleInfoUpdate.bind(this));
        this.socket.on("timerUpdate",this.handleTimerUpdate.bind(this));
        //unify action messages under one signal???
        this.socket.on("foldMessage",this.handleFoldMessage.bind(this));
        this.socket.on("callMessage",this.handleCallMessage.bind(this));

        console.log(this.socket.id);

        makeAutoObservable(this, {
            socket: false,
            //handleInit: action.bound,
            handleCreateGame: action.bound,
            handleJoinGame: action.bound,
            handleCreated: action.bound,
            handleStoreCodeChange: action.bound,
            //handleStarted: action.bound,
            //handleChangeStack: action.bound,
            handleGetCards: action.bound,
            handleTurnOptions: action.bound,
            handleTimerUpdate: action.bound,
            handleInfoUpdate: action.bound,
            handleFoldMessage: action.bound,
            handleCallMessage: action.bound,
        });
    }

    // handleInit(msg: object): void {
    //     console.log(msg);
    // }

    handleCreateGame(playerName: string) {
        this.socket.emit("newGame",playerName);
    }

    handleJoinGame(playerName: string) {
        //this.gameCode = gameCode;
        const objToSend = {
          gameCode: this.gameCode,
          playerName: playerName,
        };
        // console.log(objToSend);
        // console.log(JSON.stringify(objToSend));
        this.id = this.socket.id;
        this.socket.emit("joinGame",JSON.stringify(objToSend));
    }

    handleCreated(gameCode: string): void {
        this.gameCode = gameCode;
        this.currentPage = Page.Wait;

        this.id = this.socket.id;
    }

    handleStoreCodeChange(gameCode: string): void {
        this.gameCode = gameCode;
    }

    // handleStarted(obj: string): void {
    //     const players = JSON.parse(obj);
    //     console.log("Players",players);
    //     this.currentPage = Page.Game;
    // }

    handlePrepare(object: string): void {
        const obj = JSON.parse(object);

        Object.keys(obj).map( (item) => {
            if(item === this.id) {
                this.player.name = obj[item].name;
                this.player.stack = obj[item].stack;
                this.player.socketId = item;
            } else {
                this.opponent.name = obj[item].name;
                this.opponent.stack = obj[item].stack;
                this.opponent.socketId = item;
            }
        })

        console.log("Player",this.player);
        console.log("Opponent",this.opponent);

        this.currentPage = Page.Game;
    }

    // handleChangeStack(object: string):void {
    //     this.player.stack = parseInt(object);
    // }

    handleGetCards(object: string): void {
        const cards: string[] = JSON.parse(object);
        this.isPlaying = true;
        this.player.cards = cards;
    }

    handleTurnOptions(object: string): void {
        const obj = JSON.parse(object);

        this.isCurrentPlayer = true;
        this.actions.allin = obj.actions.allin;
        this.actions.call = obj.actions.call;
        this.actions.raise = obj.actions.raise;
        this.actions.fold = obj.actions.fold;
        this.actions.check = obj.actions.check;
    }

    handleTimerUpdate(object: string): void {
        const obj = JSON.parse(object);

        //maybe temporary
        this.message = "";

        if(obj.currentPlayer === this.id) {
            this.playerTimer = true;
            this.turnTime = obj.currentTime;
        } else {
            this.opponentTimer = true;
            this.turnTime = obj.currentTime;
        }
    }

    handleInfoUpdate(object: string): void {
        const obj = JSON.parse(object);

        this.isFirst = false;

        this.message = "";
        this.currentBank = obj.currentBank;

        Object.keys(obj.players).map( (player) => {
            if(player === this.id) {
                this.player.stack = obj.players[player].stack;
                this.player.bet = obj.players[player].bet;
                this.player.role = obj.players[player].role;
            } else {
                this.opponent.stack = obj.players[player].stack;
                this.opponent.bet = obj.players[player].bet;
                this.opponent.role = obj.players[player].role;
            }
        });
    }

    handleFoldMessage(object: string): void {
        const obj = JSON.parse(object);

        delete this.player.bet;
        delete this.opponent.bet;
        delete this.player.cards;
        delete this.opponent.cards;
        delete this.player.role;
        delete this.opponent.role;

        this.opponentTimer = false;
        this.playerTimer = false;
        this.turnTime = -1;

        this.isCurrentPlayer = false;
        this.currentBank = 0;

        this.message = obj.message;

        this.isPlaying = false;

        Object.keys(obj.players).map( (player) => {
            if (player === this.id) {
                this.player.stack = obj.players[player].stack;
            } else {
                this.opponent.stack = obj.players[player].stack;
            }
        });

    }

    handleCallMessage(object: string): void {
        const obj = JSON.parse(object);

        this.opponentTimer = false;
        this.playerTimer = false;
        this.turnTime = -1;

        this.isCurrentPlayer = false;

        this.message = obj.message;
        this.currentBank = obj.bank;

        if(obj.player.id === this.id) {
            this.player.bet = obj.player.bet;
            this.player.stack = obj.player.stack;
        }
    }

    handleFoldClick(): void {
        this.socket.emit("foldCommand",this.gameCode);
    }

    handleCallClick(): void {
        this.socket.emit("callCommand",this.gameCode);
    }
}
