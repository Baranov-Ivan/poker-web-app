import { Server, Socket } from "socket.io";
import { makeAPIurl, makeId, pickCards } from "./utils";
import {
    Actions,
    apiResult,
    BetPayload,
    EndgamePayload,
    FoldPayload,
    GameState,
    JoinState,
    Player,
    RaiseInfo,
    Role,
    StagePayload,
} from "./types";
import { createServer } from "http";
import { BIG_BLIND, SMALL_BLIND, TURN_TIME } from "./constants";

const state: Record<string, GameState> = {};

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        //origin: "http://localhost:3000",
        origin: "*",
        methods: ["GET", "POST"],
        //credentials: true,
        credentials: false
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
});

io.on("connection", (client: Socket) => {
    client.on("newGame", handleNewGame);
    client.on("joinGame", handleJoinGame);

    //Need to unify under one command handle?
    client.on("foldCommand", applyFoldCommand);
    client.on("callCommand", applyCallCommand);
    client.on("checkCommand", applyCheckCommand);
    client.on("allinCommand", applyAllinCommand);
    client.on("raiseCommand", applyRaiseCommand);

    function handleNewGame(playerName: string): void {
        let roomName = makeId(5);

        client.join(roomName);

        const gameState: GameState = {
            players: {},
            cardsInPlay: [],
            currentBank: 0,
            currentBet: 0,
            allinCondition: false,
            currentStage: 0,
            currentTable: [],
            currentPlayerTurn: "",
        };
        gameState.players[client.id] = {
            name: playerName,
            stack: 1000,
            madeTurn: false,
            cards: [],
            bet: 0,
        };
        state[roomName] = gameState;

        client.emit("gameCode", roomName);
    }

    function handleJoinGame(infoForJoin: string): void {
        const infoObject: JoinState = JSON.parse(infoForJoin);
        const roomName = infoObject.gameCode;

        const room = io.sockets.adapter.rooms.get(roomName);

        let numClients = 0;

        if (room) {
            numClients = room.size;
        }

        if (numClients === 0) {
            client.emit("unknownCode");
            return;
        } else if (numClients > 1) {
            client.emit("tooManyPlayers");
            return;
        }

        client.join(roomName);

        state[roomName].players[client.id] = {
            name: infoObject.playerName,
            stack: 1000,
            madeTurn: false,
            cards: [],
            bet: 0,
        };

        prepareForGame(roomName);
    }

    function applyFoldCommand(roomName: string): void {
        if (client.id == state[roomName].currentPlayerTurn) {
            if (validateCommand(roomName, "fold")) {
                handleCommand(roomName, "fold");
            }
        } else {
            return;
        }
        return;
    }

    function applyCallCommand(roomName: string): void {
        if (client.id == state[roomName].currentPlayerTurn) {
            if (validateCommand(roomName, "call")) {
                handleCommand(roomName, "call");
            }
        } else {
            return;
        }
        return;
    }

    function applyCheckCommand(roomName: string): void {
        if (client.id == state[roomName].currentPlayerTurn) {
            if (validateCommand(roomName, "check")) {
                handleCommand(roomName, "check");
            }
        } else {
            return;
        }
        return;
    }

    function applyAllinCommand(roomName: string): void {
        if (client.id == state[roomName].currentPlayerTurn) {
            if (validateCommand(roomName, "allin")) {
                handleCommand(roomName, "allin");
            }
        } else {
            return;
        }
        return;
    }

    function applyRaiseCommand(payload: string): void {
        const object: RaiseInfo = JSON.parse(payload);
        if (client.id == state[object.roomName].currentPlayerTurn) {
            if (validateCommand(object.roomName, "raise", object.value)) {
                handleCommand(object.roomName, "raise", parseInt(object.value));
            }
        } else {
            return;
        }
        return;
    }
});

function prepareForGame(roomName: string): void {
    io.sockets
        .in(roomName)
        .emit("preparePlayers", JSON.stringify(state[roomName].players));
    io.sockets.in(roomName).emit("prepareScreen");

    setTimeout(startPlay, 2000, roomName);
}

function startPlay(roomName: string): void {
    const looser = doesGameContinue(roomName);

    if (looser.length !== 0) {
        endGame(roomName, looser);
        return;
    }

    state[roomName].currentStage = 0;
    state[roomName].currentTable = [];
    state[roomName].currentBank = 0;
    state[roomName].allinCondition = false; // needed?

    const objectPlayersToSend: Record<string, Partial<Player>> = {};
    let isBBAssigned = false;

    Object.keys(state[roomName].players).forEach((player) => {
        state[roomName].players[player].cards = pickCards(
            state[roomName].cardsInPlay,
            2
        );
        io.to(player).emit(
            "getCards",
            JSON.stringify(state[roomName].players[player].cards)
        );
        state[roomName].cardsInPlay = state[roomName].cardsInPlay.concat(
            state[roomName].players[player].cards
        );

        state[roomName].players[player].madeTurn = false;

        if (state[roomName].players[player].role !== Role.BB && !isBBAssigned) {
            if (state[roomName].players[player].stack < BIG_BLIND) {
                state[roomName].players[player].role = Role.BB;
                state[roomName].players[player].bet =
                    state[roomName].players[player].stack;
                state[roomName].players[player].stack = 0;
                state[roomName].currentBank +=
                    state[roomName].players[player].bet;
                state[roomName].allinCondition = true;
                state[roomName].players[player].madeTurn = true;
            } else {
                state[roomName].players[player].role = Role.BB;
                state[roomName].players[player].bet = BIG_BLIND;
                state[roomName].players[player].stack -= BIG_BLIND;
                state[roomName].currentBet = BIG_BLIND;
            }
            isBBAssigned = true;
        } else {
            if (state[roomName].players[player].stack < SMALL_BLIND) {
                state[roomName].players[player].role = Role.SB;
                state[roomName].players[player].bet =
                    state[roomName].players[player].stack;
                state[roomName].players[player].stack = 0;
                state[roomName].currentBank +=
                    state[roomName].players[player].bet;
                state[roomName].allinCondition = true;
                state[roomName].players[player].madeTurn = true;
                //make another player currentPlayerTurn
                const anotherPlayer = Object.keys(state[roomName].players).find(
                    (anotherPlayer) => anotherPlayer !== player
                );
                if (anotherPlayer != null)
                    state[roomName].currentPlayerTurn = anotherPlayer;
            } else {
                state[roomName].players[player].role = Role.SB;
                state[roomName].players[player].bet = SMALL_BLIND;
                state[roomName].players[player].stack -= SMALL_BLIND;
                state[roomName].currentBank = BIG_BLIND + SMALL_BLIND;
                state[roomName].currentPlayerTurn = player;
            }
        }

        objectPlayersToSend[player] = {
            role: state[roomName].players[player].role,
            bet: state[roomName].players[player].bet,
            stack: state[roomName].players[player].stack,
        };
    });

    const objectBankToSend = { bank: state[roomName].currentBank };

    io.in(roomName).emit(
        "tableUpdate",
        JSON.stringify(state[roomName].currentTable)
    );
    io.in(roomName).emit("bankUpdate", JSON.stringify(objectBankToSend));
    io.in(roomName).emit(
        "playersStartUpdate",
        JSON.stringify(objectPlayersToSend)
    );
    startInterval(roomName);
}

function startInterval(roomName: string): void {
    state[roomName].currentTime = TURN_TIME;

    io.to(state[roomName].currentPlayerTurn).emit(
        "turnOptions",
        JSON.stringify({ actions: calculatePossibleActions(roomName) })
    );
    timerInterval(roomName);
    state[roomName].currentInterval = setInterval(
        timerInterval,
        1000,
        roomName
    );
}

function timerInterval(roomName: string): void {
    if (
        state[roomName].currentInterval == null ||
        state[roomName].currentTime == null
    ) {
        return;
    }

    if (state[roomName].currentTime === 0) {
        clearInterval(state[roomName].currentInterval!);
        if (
            state[roomName].players[state[roomName].currentPlayerTurn].bet <
            state[roomName].currentBet
        ) {
            handleCommand(roomName, "fold");
        } else {
            handleCommand(roomName, "check");
        }
        return;
    }

    io.in(roomName).emit(
        "timerUpdate",
        JSON.stringify({
            currentPlayer: state[roomName].currentPlayerTurn,
            currentTime: state[roomName].currentTime,
        })
    );
    state[roomName].currentTime!--;
}

function handleCommand(
    roomName: string,
    command: string,
    value?: number
): void {
    const currentPlayer = state[roomName].currentPlayerTurn;

    switch (command) {
        case "fold":
            const objectFoldToSend: FoldPayload = { players: {}, message: "" };
            Object.keys(state[roomName].players).forEach((player) => {
                if (currentPlayer !== player) {
                    state[roomName].players[player].stack +=
                        state[roomName].currentBank;
                }

                objectFoldToSend.players[player] = {
                    stack: state[roomName].players[player].stack,
                };
            });

            state[roomName].currentBank = 0;
            state[roomName].cardsInPlay = [];
            state[roomName].currentStage = 0;

            if (state[roomName].currentInterval != null)
                clearInterval(state[roomName].currentInterval!);

            const foldMessage = createMessage(
                "fold",
                state[roomName].players[currentPlayer].name
            );
            objectFoldToSend.message = foldMessage;
            io.in(roomName).emit(
                "foldMessage",
                JSON.stringify(objectFoldToSend)
            );

            setTimeout(() => {
                startPlay(roomName);
            }, 3000);
            break;

        case "check":
            state[roomName].players[currentPlayer].madeTurn = true;
            if (state[roomName].currentInterval != null)
                clearInterval(state[roomName].currentInterval!);

            const checkMessage = createMessage(
                "check",
                state[roomName].players[currentPlayer].name
            );
            io.in(roomName).emit("checkMessage", checkMessage);

            checkGameState(roomName);
            break;
        case "call":
            state[roomName].players[currentPlayer].madeTurn = true;
            const diff =
                state[roomName].currentBet -
                state[roomName].players[currentPlayer].bet;
            state[roomName].currentBank += diff;
            state[roomName].players[currentPlayer].bet =
                state[roomName].currentBet;
            state[roomName].players[currentPlayer].stack -= diff;

            if (state[roomName].currentInterval != null)
                clearInterval(state[roomName].currentInterval!);

            const callMessage = createMessage(
                "call",
                state[roomName].players[currentPlayer].name
            );
            const objectCallToSend: BetPayload = {
                bank: state[roomName].currentBank,
                message: callMessage,
                player: {
                    id: currentPlayer,
                    stack: state[roomName].players[currentPlayer].stack,
                    bet: state[roomName].players[currentPlayer].bet,
                },
            };

            io.in(roomName).emit(
                "callMessage",
                JSON.stringify(objectCallToSend)
            );

            checkGameState(roomName);
            break;
        case "raise":
            if (value == null) return;

            state[roomName].players[currentPlayer].madeTurn = true;
            state[roomName].currentBank += value;
            state[roomName].players[currentPlayer].bet += value;
            state[roomName].currentBet =
                state[roomName].players[currentPlayer].bet;
            state[roomName].players[currentPlayer].stack -= value;

            if (state[roomName].players[currentPlayer].stack === 0) {
                state[roomName].allinCondition = true;
            }

            if (state[roomName].currentInterval != null)
                clearInterval(state[roomName].currentInterval!);

            const raiseMessage = createMessage(
                "raise",
                state[roomName].players[currentPlayer].name,
                state[roomName].currentBet
            );
            const objectRaiseToSend: BetPayload = {
                bank: state[roomName].currentBank,
                message: raiseMessage,
                player: {
                    id: currentPlayer,
                    stack: state[roomName].players[currentPlayer].stack,
                    bet: state[roomName].players[currentPlayer].bet,
                },
            };

            io.in(roomName).emit(
                "raiseMessage",
                JSON.stringify(objectRaiseToSend)
            );

            checkGameState(roomName);
            break;
        case "allin":
            state[roomName].players[currentPlayer].madeTurn = true;
            state[roomName].players[currentPlayer].bet +=
                state[roomName].players[currentPlayer].stack;
            if (
                state[roomName].currentBet <
                state[roomName].players[currentPlayer].bet
            ) {
                state[roomName].currentBet =
                    state[roomName].players[currentPlayer].bet;
            }
            state[roomName].currentBank +=
                state[roomName].players[currentPlayer].stack;
            // not handle currentBet field, because all-in is special case???
            state[roomName].players[currentPlayer].stack = 0;
            state[roomName].allinCondition = true;

            if (state[roomName].currentInterval != null)
                clearInterval(state[roomName].currentInterval!);

            const allinMessage = createMessage(
                "allin",
                state[roomName].players[currentPlayer].name
            );

            const objectAllinToSend: BetPayload = {
                bank: state[roomName].currentBank,
                message: allinMessage,
                player: {
                    id: currentPlayer,
                    stack: state[roomName].players[currentPlayer].stack,
                    bet: state[roomName].players[currentPlayer].bet,
                },
            };

            io.in(roomName).emit(
                "allinMessage",
                JSON.stringify(objectAllinToSend)
            );

            checkGameState(roomName);
            break;
        default:
            break;
    }
}

function checkGameState(roomName: string): void {
    let stillPlaying = false;

    Object.keys(state[roomName].players).forEach((player) => {
        if (state[roomName].players[player].madeTurn) {
            if (
                state[roomName].players[player].bet <
                    state[roomName].currentBet &&
                state[roomName].players[player].stack > 0
            ) {
                state[roomName].currentPlayerTurn = player;
                stillPlaying = true;
                setTimeout(startInterval, 3000, roomName);
                return;
            }
        } else {
            state[roomName].currentPlayerTurn = player;
            stillPlaying = true;
            setTimeout(startInterval, 3000, roomName);
            return;
        }
    });

    if (stillPlaying) return;

    state[roomName].currentStage++;

    //handling of all-in state
    if (state[roomName].allinCondition) {
        io.in(roomName).emit("showtime");
        setTimeout(() => handleAllinState(roomName), 3000);
        return;
    }

    handleStage(roomName);
    return;
}

function handleStage(roomName: string): void {
    state[roomName].currentBet = 0;

    const objectToSend: StagePayload = { players: {} };

    Object.keys(state[roomName].players).forEach((player) => {
        state[roomName].players[player].bet = 0;
        state[roomName].players[player].madeTurn = false;
        if (state[roomName].players[player].role === "sb") {
            state[roomName].currentPlayerTurn = player;
        }

        objectToSend.players[player] = { bet: 0 };
    });

    io.in(roomName).emit("stageChange", JSON.stringify(objectToSend));

    switch (state[roomName].currentStage) {
        case 1:
            state[roomName].currentTable = state[roomName].currentTable.concat(
                pickCards(state[roomName].cardsInPlay, 3)
            );
            state[roomName].cardsInPlay = state[roomName].cardsInPlay.concat(
                state[roomName].currentTable
            );
            setTimeout(() => {
                io.in(roomName).emit(
                    "tableUpdate",
                    JSON.stringify(state[roomName].currentTable)
                );
                startInterval(roomName);
            }, 3000);
            return;
        case 2:
        case 3:
            state[roomName].currentTable = state[roomName].currentTable.concat(
                pickCards(state[roomName].cardsInPlay, 1)
            );
            state[roomName].cardsInPlay = state[roomName].cardsInPlay.concat(
                state[roomName].currentTable
            );
            setTimeout(() => {
                io.in(roomName).emit(
                    "tableUpdate",
                    JSON.stringify(state[roomName].currentTable)
                );
                startInterval(roomName);
            }, 3000);
            return;
        case 4:
            const fetch = require("node-fetch");
            const stringsForAPI: string[] = [];
            Object.keys(state[roomName].players).forEach((player) => {
                stringsForAPI.push(
                    state[roomName].players[player].cards.join(",")
                );
            });

            (async () => {
                try {
                    const apiString = makeAPIurl(
                        state[roomName].currentTable.join(","),
                        stringsForAPI
                    );
                    const response = await fetch(apiString);
                    const result: apiResult = await response.json();
                    handlePlayWinner(roomName, result);
                } catch (error) {
                    console.log(error);
                }
            })();
            return;
        default:
            return;
    }
}

function handleAllinState(roomName: string): void {
    switch (state[roomName].currentStage) {
        case 1:
            state[roomName].currentTable = state[roomName].currentTable.concat(
                pickCards(state[roomName].cardsInPlay, 3)
            );
            state[roomName].cardsInPlay = state[roomName].cardsInPlay.concat(
                state[roomName].currentTable
            );
            io.in(roomName).emit(
                "tableUpdate",
                JSON.stringify(state[roomName].currentTable)
            );
            state[roomName].currentStage++;
            setTimeout(() => {
                handleAllinState(roomName);
            }, 1000);
            return;
        case 2:
        case 3:
            state[roomName].currentTable = state[roomName].currentTable.concat(
                pickCards(state[roomName].cardsInPlay, 1)
            );
            state[roomName].cardsInPlay = state[roomName].cardsInPlay.concat(
                state[roomName].currentTable
            );
            io.in(roomName).emit(
                "tableUpdate",
                JSON.stringify(state[roomName].currentTable)
            );
            state[roomName].currentStage++;
            setTimeout(() => {
                handleAllinState(roomName);
            }, 1000);
            return;
        case 4:
            const fetch = require("node-fetch");
            const stringsForAPI: string[] = [];
            Object.keys(state[roomName].players).forEach((player) => {
                stringsForAPI.push(
                    state[roomName].players[player].cards.join(",")
                );
            });

            (async () => {
                try {
                    const apiString = makeAPIurl(
                        state[roomName].currentTable.join(","),
                        stringsForAPI
                    );
                    const response = await fetch(apiString);
                    const result: apiResult = await response.json();
                    //handlePlayWinner(roomName,result,stringsForAPI);
                    handlePlayWinner(roomName, result);
                } catch (error) {
                    console.log(error);
                }
            })();
            return;
        default:
            return;
    }
}

function calculatePossibleActions(roomName: string): Actions {
    const actions = {
        call: false,
        raise: false,
        check: false,
        fold: false,
        allin: false,
        raiseMaxLim: -1,
        raiseMinLim: -1,
    };

    const playerBet =
        state[roomName].players[state[roomName].currentPlayerTurn].bet;
    const playerStack =
        state[roomName].players[state[roomName].currentPlayerTurn].stack;
    const currentBet = state[roomName].currentBet;

    if (playerBet === currentBet) {
        actions.check = true;
    } else {
        actions.fold = true;
    }

    if (playerStack <= currentBet - playerBet) {
        actions.allin = true;
    } else {
        actions.raise = true;
        actions.raiseMaxLim = playerStack;
        actions.raiseMinLim = currentBet - playerBet + 1;
        actions.allin = true;
    }

    if (playerBet < currentBet && playerStack >= currentBet - playerBet) {
        actions.call = true;
    }

    return actions;
}

function createMessage(
    command: string,
    playerName: string,
    betValue?: number
): string {
    if (betValue == null) {
        return "Player " + playerName + " " + command;
    } else {
        return "Player " + playerName + " " + command + " to " + betValue;
    }
}

function validateCommand(
    roomName: string,
    command: string,
    value?: string
): boolean {
    const currentPlayer = state[roomName].currentPlayerTurn;

    switch (command) {
        case "fold":
            return (
                state[roomName].players[currentPlayer].bet <
                state[roomName].currentBet
            );

        case "check":
            return (
                state[roomName].players[currentPlayer].bet ===
                    state[roomName].currentBet &&
                !state[roomName].players[currentPlayer].madeTurn
            );

        case "raise":
            if (value == null) return false;

            const intValue = parseInt(value);
            return (
                intValue <= state[roomName].players[currentPlayer].stack ||
                intValue >
                    state[roomName].currentBet -
                        state[roomName].players[currentPlayer].bet
            );

        case "allin":
            return state[roomName].players[currentPlayer].stack > 0;

        case "call":
            return (
                state[roomName].players[currentPlayer].stack +
                    state[roomName].players[currentPlayer].bet >=
                    state[roomName].currentBet -
                        state[roomName].players[currentPlayer].bet &&
                state[roomName].players[currentPlayer].bet <
                    state[roomName].currentBet
            );

        default:
            return false;
    }
}

function handlePlayWinner(roomName: string, result: apiResult): void {
    //TODO: handle specific case when both players have equal hands and the bank splits
    if (result.winners.length === 2) {
    }

    const playersCardsObj: Record<string, string[]> = {};
    let winner: string = "";
    let loser: string = "";
    Object.keys(state[roomName].players).forEach((player) => {
        if (
            state[roomName].players[player].cards.join(",") ===
            result.winners[0].cards
        ) {
            winner = player;
        } else {
            loser = player;
        }
        playersCardsObj[player] = state[roomName].players[player].cards;
    });

    const combination = result.winners[0].result.replace(/_/g, " ");
    const message =
        "Player " +
        state[roomName].players[winner].name +
        " wins the bank" +
        " with " +
        combination;

    const objToSend: EndgamePayload = {
        players: {},
        bank: state[roomName].currentBank,
        message: "",
    };

    if (state[roomName].allinCondition) {
        if (
            state[roomName].players[winner].bet >=
            state[roomName].players[loser].bet
        ) {
            state[roomName].players[winner].stack +=
                state[roomName].currentBank;
        } else {
            state[roomName].players[winner].stack =
                state[roomName].players[winner].bet * 2;
            state[roomName].players[loser].stack +=
                state[roomName].currentBank -
                state[roomName].players[winner].bet * 2;
        }
    } else {
        state[roomName].players[winner].stack += state[roomName].currentBank;
    }

    state[roomName].currentBank = 0;

    objToSend.players[winner] = state[roomName].players[winner].stack;
    objToSend.players[loser] = state[roomName].players[loser].stack;
    objToSend.message = message;
    io.in(roomName).emit("cardsReveal", JSON.stringify(playersCardsObj));
    setTimeout(() => {
        io.in(roomName).emit("playWinner", JSON.stringify(objToSend));
        setTimeout(() => {
            startPlay(roomName);
        }, 5000);
    }, 3000);
    return;
}

function doesGameContinue(roomName: string): string {
    let loser = "";
    Object.keys(state[roomName].players).forEach((player) => {
        if (state[roomName].players[player].stack === 0) {
            loser = player;
        }
    });

    return loser;
}

function endGame(roomName: string, loser: string): void {
    io.in(roomName).emit("endGame", loser);
    io.in(roomName).emit("endPlayersGame");
    delete state[roomName];
    return;
}

//io.listen(process.env.port || 3001);
io.listen(parseInt(<string>process.env.PORT, 10) || 3001);
