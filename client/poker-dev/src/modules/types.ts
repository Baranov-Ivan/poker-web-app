export enum Page {
    Home = "home",
    Wait = "wait",
    Game = "game",
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
}