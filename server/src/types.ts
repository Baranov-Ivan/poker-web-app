export interface JoinState {
    playerName: string;
    gameCode: string;
}

export interface Player {
    name: string;
    cards: string[];
    bet: number;
    role?: Role;
    madeTurn: boolean;
    stack: number;
}

export enum Role {
    BB = "bb",
    SB = "sb",
}

export interface apiPlayer {
    cards: string;
    hand: string;
    result: string;
}

export interface apiResult {
    winners: apiPlayer[];
    players: apiPlayer[];
}

export interface GameState {
    currentInterval?: NodeJS.Timeout;
    currentTime?: number;
    currentBank: number;
    currentBet: number;
    currentPlayerTurn: string;
    currentStage: number;
    cardsInPlay: string[];
    currentTable: string[];
    allinCondition: boolean;
    players: Record<string, Player>;
}

export interface Actions {
    call: boolean;
    raise: boolean;
    check: boolean;
    fold: boolean;
    allin: boolean;
    raiseMaxLim?: number;
    raiseMinLim?: number;
}

export interface RaiseInfo {
    roomName: string;
    value: string;
}

export interface FoldPayload {
    players: Record<string, { stack: number }>;
    message: string;
}

export interface BetPayload {
    bank: number;
    message: string;
    player: {
        id: string;
        stack: number;
        bet: number;
    };
}

export interface StagePayload {
    players: Record<string, Partial<Player>>;
}

export interface EndgamePayload {
    players: Record<string, number>;
    bank: number;
    message: string;
}
