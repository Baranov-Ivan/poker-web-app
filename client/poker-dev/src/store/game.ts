import {Socket} from "./socket";
import {action, makeAutoObservable} from "mobx";
import {BetPayload, EndgamePayload, FoldPayload} from "../types/types";


export class Game {
    socket: Socket;

    table: string[] = [];
    currentBank = 0;

    message = "";

    constructor(socket: Socket) {
        this.socket  = socket;
        this.socket.socket.on("bankUpdate", this.handleBankUpdate.bind(this));
        this.socket.socket.on("tableUpdate", this.handleTableUpdate.bind(this));
        this.socket.socket.on("playersStartUpdate", this.handleStartPlay.bind(this));
        this.socket.socket.on("turnOptions", this.handleTurnOptions.bind(this));
        this.socket.socket.on("foldMessage", this.handleFoldMessage.bind(this));
        this.socket.socket.on("checkMessage", this.handleCheckMessage.bind(this));
        this.socket.socket.on("callMessage", this.handleCommandMessage.bind(this));
        this.socket.socket.on("raiseMessage", this.handleCommandMessage.bind(this));
        this.socket.socket.on("allinMessage", this.handleCommandMessage.bind(this));
        this.socket.socket.on("showtime",this.handleShowtimeMessage.bind(this));
        this.socket.socket.on("cardsReveal",this.handleCardsReveal.bind(this));
        this.socket.socket.on("playWinner",this.handlePlayWinner.bind(this));
        this.socket.socket.on("endGame",this.handleGameOver.bind(this));

        makeAutoObservable(this, {
            socket: false,
            setCurrentBank: action.bound,
            setCurrentTable: action.bound,
            setMessage: action.bound,
        })
    }

    setCurrentBank(bank: number): void {
        this.currentBank = bank;
    }

    setCurrentTable(table: string[]): void {
        this.table = table;
    }

    setMessage(message: string): void {
        this.message = message;
    }

    handleBankUpdate(object: string): void {
        const bankObject: {bank: number} = JSON.parse(object);

        this.setCurrentBank(bankObject.bank);
    }

    handleTableUpdate(object: string): void {
        const table: string[] = JSON.parse(object);

        this.setCurrentTable(table);
    }

    handleStartPlay(object: string): void {
        this.setMessage("");
    }

    handleTurnOptions(object: string): void {
        this.setMessage("");
    }

    handleFoldMessage(object: string): void {
        const obj: FoldPayload = JSON.parse(object);

        this.setMessage(obj.message);
        this.setCurrentBank(0);
    }

    handleCheckMessage(message: string): void {
        this.setMessage(message);
    }

    handleCommandMessage(object: string): void {
        const obj: BetPayload = JSON.parse(object);

        this.setMessage(obj.message);
        this.setCurrentBank(obj.bank);
    }

    handleShowtimeMessage(): void {
        this.setMessage("It is showtime!");
    }

    handleCardsReveal(object: string): void {
        this.setMessage("Showdown!");
    }

    handlePlayWinner(object: string): void {
        const obj: EndgamePayload = JSON.parse(object);

        this.setCurrentBank(obj.bank);
        this.setMessage(obj.message);
    }

    handleGameOver(loser: string): void {
        if(this.socket.socket.id === loser) {
            this.setMessage("You loose");
        } else {
            this.setMessage("You win");
        }
        this.setCurrentTable([]);
        this.setCurrentBank(0);

        setTimeout(() => {
           this.setMessage("");
        }, 5000);
    }
}