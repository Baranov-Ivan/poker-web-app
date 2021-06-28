import socketIOClient from "socket.io-client";
import {action, makeAutoObservable} from "mobx";
import {Page} from "../modules/types";

export class Socket {
    socket = socketIOClient("http://localhost:3001",{
        withCredentials: true
    });

    gameCode = "";
    currentPage: Page = Page.Home;

    constructor() {
        this.socket.on("init", this.handleInit);
        this.socket.on("gameCode", this.handleCreated);

        makeAutoObservable(this, {
            socket: false,
            handleInit: action.bound,
            handleCreateGame: action.bound,
            handleJoinGame: action.bound,
            handleCreated: action.bound,
            handleStoreCodeChange: action.bound,
        });
    }

    handleInit(msg: object): void {
        console.log(msg);
    }

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
        this.socket.emit("joinGame",JSON.stringify(objToSend));
    }

    handleCreated(gameCode: string): void {
        this.gameCode = gameCode;
        this.currentPage = Page.Wait;
        console.log(this.currentPage);
        alert(this.gameCode);
    }

    handleStoreCodeChange(gameCode: string): void {
        this.gameCode = gameCode;
    }
}
