export enum Page {
    Home = "home",
    Wait = "wait",
    Game = "game",
    Gameover = "gameover",
}

export interface Player {
    name?: string,
    socketId?: string,
    cards?: string[],
    stack?: number,
    bet?: number,
    role?: string,
}

export interface Actions  {
    call: boolean,
    raise: boolean,
    check: boolean,
    fold: boolean,
    allin: boolean,
    raiseMaxLim: number,
    raiseMinLim: number,
}

export interface RaiseInfo {
    roomName: string,
    value: string,
}

export interface FoldPayload {
    players: Record<string, {stack: number}>,
    message: string,
}

export interface BetPayload {
    bank: number,
    message: string,
    player: {
        id: string,
        stack: number,
        bet: number,
    }
}

export interface StagePayload {
    players: Record<string, Player>;
}


export interface EndgamePayload {
    players: Record<string, number>;
    bank: number,
    message: string,
}

export interface TimerPayload {
    currentPlayer: string,
    currentTime: number,
}

export enum Role {
    BB = "bb",
    SB = "sb",
}