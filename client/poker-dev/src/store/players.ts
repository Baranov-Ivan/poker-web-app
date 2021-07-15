import {
    EndgamePayload,
    FoldPayload,
    Player,
    StagePayload,
    BetPayload,
} from "../types/types";
import { Socket } from "./socket";
import { action, makeAutoObservable } from "mobx";

export class Players {
    players: Record<string, Player> = {};
    clientId = "";
    opponentId = "";
    socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;

        this.socket.socket.on("preparePlayers", this.handlePrepare.bind(this));
        this.socket.socket.on("getCards", this.handleGetCards.bind(this));
        this.socket.socket.on(
            "playersStartUpdate",
            this.handleStartPlay.bind(this)
        );
        this.socket.socket.on("foldMessage", this.handleFoldMessage.bind(this));
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
        this.socket.socket.on("stageChange", this.handleStageChange.bind(this));
        this.socket.socket.on("cardsReveal", this.handleCardsReveal.bind(this));
        this.socket.socket.on("playWinner", this.handlePlayWinner.bind(this));
        this.socket.socket.on("endPlayersGame", this.handleGameOver.bind(this));

        makeAutoObservable(this, {
            socket: false,
            initPlayers: action.bound,
            setClientId: action.bound,
            removeClientId: action.bound,
            setOpponentId: action.bound,
            setPlayerCards: action.bound,
            setPlayerRole: action.bound,
            setPlayerBet: action.bound,
            setPlayerStack: action.bound,
        });
    }

    setClientId(): void {
        this.clientId = this.socket.socket.id;
    }

    removeClientId(): void {
        this.clientId = "";
    }

    setPlayerCards(playerId: string, cards: string[] | undefined): void {
        this.players[playerId].cards = cards;
    }

    setOpponentId(opponentId: string): void {
        this.opponentId = opponentId;
    }

    setPlayerRole(playerId: string, role: string | undefined): void {
        this.players[playerId].role = role;
    }

    setPlayerBet(playerId: string, bet: number | undefined): void {
        this.players[playerId].bet = bet;
    }

    setPlayerStack(playerId: string, stack: number): void {
        this.players[playerId].stack = stack;
    }

    initPlayers(players: Record<string, Player>): void {
        //this.players = players;
        this.players = Object.assign(players);
    }

    handlePrepare(object: string): void {
        this.setClientId();

        const players: Record<string, Player> = JSON.parse(object);

        this.initPlayers(players);
        const opponentId = Object.keys(this.players).find(
            (player) => player !== this.clientId
        );

        if (!opponentId) {
            return;
        }

        this.setOpponentId(opponentId);
    }

    handleGetCards(object: string): void {
        const cards: string[] = JSON.parse(object);
        this.setPlayerCards(this.clientId, cards);
        this.setPlayerCards(this.opponentId, []);
    }

    handleStartPlay(object: string): void {
        const players: Record<string, Player> = JSON.parse(object);

        Object.keys(players).forEach((player) => {
            this.setPlayerRole(player, players[player].role!);
            this.setPlayerBet(player, players[player].bet!);
            this.setPlayerStack(player, players[player].stack!);
        });
    }

    handleFoldMessage(object: string): void {
        const obj: FoldPayload = JSON.parse(object);

        Object.keys(obj.players).forEach((player) => {
            this.setPlayerBet(player, undefined);
            this.setPlayerCards(player, undefined);
            this.setPlayerRole(player, undefined);
            this.setPlayerStack(player, obj.players[player].stack);
        });
    }

    handleCommandMessage(object: string): void {
        const obj: BetPayload = JSON.parse(object);

        this.setPlayerStack(obj.player.id, obj.player.stack);
        this.setPlayerBet(obj.player.id, obj.player.bet);
    }

    handleStageChange(object: string): void {
        const obj: StagePayload = JSON.parse(object);

        Object.keys(obj.players).forEach((player) => {
            this.setPlayerBet(player, obj.players[player].bet);
        });
    }

    handleCardsReveal(object: string): void {
        const obj: Record<string, string[]> = JSON.parse(object);

        Object.keys(obj).forEach((player) => {
            if (player !== this.clientId) {
                this.setPlayerCards(player, obj[player]);
            }
        });
    }

    handlePlayWinner(object: string): void {
        const obj: EndgamePayload = JSON.parse(object);

        Object.keys(obj.players).forEach((player) => {
            this.setPlayerStack(player, obj.players[player]);
        });
    }

    handleGameOver(): void {
        this.initPlayers({});
        this.removeClientId();
        this.setOpponentId("");
    }
}
