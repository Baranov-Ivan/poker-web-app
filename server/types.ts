export interface JoinState {
    playerName: string,
    gameCode: string,
}

export interface Player {
    name: string,
    //socketId: string,
    cards?: string[],
    bet?: number,
    role?: Role,
    madeTurn?: boolean,
    stack: number,
}

export interface playerNames {
    yourName: string,
    opponentName: string,
}

export enum Role {
    BB = "bb",
    SB = "sb",
}

// export enum Stage {
//     Preflop = "Preflop",
//     Flop = "Flop",
//     Turn = "Turn",
//     River = "River",
//     Showdown = "Showdown",
// }

export interface GameState {
    currentInterval?: NodeJS.Timeout,
    currentTime?: number,
    currentBank?: number,
    currentBet?: number,
    currentPlayerTurn?: string, //name or id
    //currentStage?: Stage, // maybe not needed
    currentStage?: number,
    cardsInPlay?: string[],
    currentTable?: string[],
    roomId?: string, // is it necessary??
    //players?: Player[],
    players?: Record<string,Player>,
}

export interface Actions  {
    call: boolean,
    raise: boolean,
    check: boolean,
    fold: boolean,
    allin: boolean,
}