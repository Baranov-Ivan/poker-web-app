import { Actions, Page, RaiseInfo, TimerPayload } from "../types/types";
import { Socket } from "./socket";
import { action, makeAutoObservable } from "mobx";

export class Controller {
    socket: Socket;

    gameCode = "";
    currentPage: Page = Page.Home;
    clientId: string = "";
    isCurrentPlayer = false;

    raiseValue = "";

    actions: Actions = {
        call: false,
        raise: false,
        check: false,
        fold: false,
        allin: false,
        raiseMaxLim: -1,
        raiseMinLim: -1,
    };

    emptyNameMessage = false;
    emptyCodeMessage = false;
    manyPlayersMessage = false;
    wrongCodeMessage = false;

    opponentTimer = false;
    playerTimer = false;
    turnTime = -1;

    constructor(socket: Socket) {
        this.socket = socket;

        this.socket.socket.on("gameCode", this.handleCreated.bind(this));
        this.socket.socket.on(
            "tooManyPlayers",
            this.handleManyPlayers.bind(this)
        );
        this.socket.socket.on("unknownCode", this.handleUnknownCode.bind(this));
        this.socket.socket.on("prepareScreen", this.handlePrepare.bind(this));
        this.socket.socket.on("turnOptions", this.handleTurnOptions.bind(this));
        this.socket.socket.on("timerUpdate", this.handleTimerUpdate.bind(this));
        this.socket.socket.on("foldMessage", this.handleFoldMessage.bind(this));
        this.socket.socket.on(
            "checkMessage",
            this.handleCommandMessage.bind(this)
        );
        this.socket.socket.on(
            "callMessage",
            this.handleCommandMessage.bind(this)
        );
        this.socket.socket.on(
            "raiseMessage",
            this.handleCommandMessage.bind(this)
        );
        this.socket.socket.on(
            "allinMessage",
            this.handleCommandMessage.bind(this)
        );
        this.socket.socket.on("endGame", this.handleGameOver.bind(this));

        makeAutoObservable(this, {
            socket: false,
            toggleEmptyNameMessage: action.bound,
            toggleEmptyCodeMessage: action.bound,
            toggleManyPlayersMessage: action.bound,
            toggleWrongCodeMessage: action.bound,
            togglePlayerTimer: action.bound,
            toggleOpponentTimer: action.bound,
            setCurrentTime: action.bound,
            setGameCode: action.bound,
            setCurrentPage: action.bound,
            setClientId: action.bound,
            removeClientId: action.bound,
            setActions: action.bound,
            setRaiseValue: action.bound,
            toggleIsCurrentPlayer: action.bound,
        });
    }

    checkField(value: string, field: string): boolean {
        if (!value.length) {
            switch (field) {
                case "name":
                    this.toggleEmptyNameMessage(true);
                    return false;
                case "code":
                    this.toggleEmptyCodeMessage(true);
                    return false;
                default:
                    return true;
            }
        }
        return true;
    }

    toggleEmptyNameMessage(state: boolean): void {
        this.emptyNameMessage = state;
    }

    toggleEmptyCodeMessage(state: boolean): void {
        this.emptyCodeMessage = state;
    }

    toggleManyPlayersMessage(state: boolean): void {
        this.manyPlayersMessage = state;
    }

    toggleWrongCodeMessage(state: boolean): void {
        this.wrongCodeMessage = state;
    }

    toggleIsCurrentPlayer(state: boolean): void {
        this.isCurrentPlayer = state;
    }

    togglePlayerTimer(state: boolean): void {
        this.playerTimer = state;
    }

    toggleOpponentTimer(state: boolean): void {
        this.opponentTimer = state;
    }

    setCurrentTime(time: number): void {
        this.turnTime = time;
    }

    handleCreateGame(playerName: string): void {
        this.socket.socket.emit("newGame", playerName);
    }

    handleJoinGame(playerName: string, gameCode: string) {
        this.setGameCode(gameCode);

        this.setClientId();
        const objToSend = {
            gameCode: gameCode,
            playerName: playerName,
        };

        this.socket.socket.emit("joinGame", JSON.stringify(objToSend));
    }

    handlePrepare(object: string): void {
        this.setCurrentPage(Page.Game);
    }

    setGameCode(gameCode: string): void {
        this.gameCode = gameCode;
    }

    setCurrentPage(page: Page): void {
        this.currentPage = page;
    }

    setClientId(): void {
        this.clientId = this.socket.socket.id;
    }

    removeClientId(): void {
        this.clientId = "";
    }

    setActions(actions: Actions): void {
        this.actions = Object.assign(actions);
    }

    setRaiseValue(value: string): void {
        this.raiseValue = value;
    }

    handleCreated(gameCode: string): void {
        this.setClientId();
        this.setGameCode(gameCode);
        this.setCurrentPage(Page.Wait);
    }

    handleTurnOptions(object: string): void {
        const actions: { actions: Actions } = JSON.parse(object);

        this.setActions(actions.actions);
        this.toggleIsCurrentPlayer(true);
    }

    handleTimerUpdate(object: string): void {
        const timer: TimerPayload = JSON.parse(object);

        if (timer.currentPlayer === this.clientId) {
            this.togglePlayerTimer(true);
        } else {
            this.toggleOpponentTimer(true);
        }

        this.setCurrentTime(timer.currentTime);
    }

    handleFoldMessage(object: string) {
        this.toggleIsCurrentPlayer(false);
        this.togglePlayerTimer(false);
        this.toggleOpponentTimer(false);
        this.setCurrentTime(-1);
    }

    handleCommandMessage(object: string) {
        this.toggleIsCurrentPlayer(false);
        this.togglePlayerTimer(false);
        this.toggleOpponentTimer(false);
        this.setCurrentTime(-1);
    }

    handleGameOver(loser: string): void {
        this.setGameCode("");
        this.removeClientId();
        this.toggleIsCurrentPlayer(false);
        this.toggleOpponentTimer(false);
        this.togglePlayerTimer(false);
        this.setCurrentTime(-1);

        this.setCurrentPage(Page.Gameover);

        setTimeout(() => {
            this.setCurrentPage(Page.Home);
        }, 5000);
    }

    handleManyPlayers(): void {
        this.toggleManyPlayersMessage(true);
    }

    handleUnknownCode(): void {
        this.toggleWrongCodeMessage(true);
    }

    handleFoldClick(): void {
        this.socket.socket.emit("foldCommand", this.gameCode);
    }

    handleCallClick(): void {
        this.socket.socket.emit("callCommand", this.gameCode);
    }

    handleCheckClick(): void {
        this.socket.socket.emit("checkCommand", this.gameCode);
    }

    handleAllinClick(): void {
        this.socket.socket.emit("allinCommand", this.gameCode);
    }

    handleRaiseClick(): void {
        const objToSend: RaiseInfo = {
            roomName: this.gameCode,
            value: this.raiseValue,
        };
        this.socket.socket.emit("raiseCommand", JSON.stringify(objToSend));
        this.setRaiseValue("");
    }
}
