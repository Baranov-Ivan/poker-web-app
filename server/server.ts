import {Server, Socket} from "socket.io";
import {getKeysByValue, makeId, pickCards} from "./utils";
import {Actions, GameState, JoinState, playerNames, Role} from "./types";
import {createServer} from "http";
import {BIG_BLIND, SMALL_BLIND, TURN_TIME} from "./constants";


const state: Record<string,GameState> = {};
const clientRooms: Record<string,string> = {};
const clientNames: Record<string, string> = {};

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

io.on('connection', (client: Socket) => {
    //client.emit('init', {data: "hello world"});

    client.on("newGame", handleNewGame);
    client.on("joinGame", handleJoinGame);

    //Need to unify under one command handle?
    client.on("foldCommand", applyFoldCommand);
    client.on("callCommand", applyCallCommand);

    function handleNewGame(playerName: string): void {
        let roomName = makeId(5);
        clientRooms[client.id] = roomName;

        //тут инициализируется начальный state для партии??
        //state[roomName] = some function

        client.join(roomName);
        //Temporary removed. TS issues. Must be handled in custom object
        ////client.number = 1;
        ////client.name = playerName;

        clientNames[client.id] = playerName;

        const gameState: GameState = { players: {}, cardsInPlay: [],};
        gameState.players[client.id] = {
            name: playerName,
            stack: 1000,
        };
        state[roomName] = gameState;

        client.emit("gameCode", roomName);
        //client.emit("init", 1);
    }

    function handleJoinGame(infoForJoin: string): void {
        const infoObject: JoinState = JSON.parse(infoForJoin);
        const roomName = infoObject.gameCode;

        const room = io.sockets.adapter.rooms.get(roomName);

        let numClients = 0;

        if(room) {
            numClients = room.size;
        }

        if(numClients === 0) {
            //client.emit("unknownCode");
            return;
        } else if (numClients > 1) {
            //client.emit("tooManyPlayers");
            return;
        }

        clientRooms[client.id] = roomName;
        clientNames[client.id] = infoObject.playerName;
        client.join(roomName);
        //Temporary removed. TS issues. Must be handled in custom object
        ////client.number = 2;
        ////client.playerName = infoObject.playerName;
        //startGameInterval(roomName);
        // console.log("Aftermath",io.sockets.adapter.rooms.get(roomName));
        // console.log("Current rooms",io.sockets.adapter.rooms);
        // console.log("Current rooms length",io.sockets.adapter.rooms.size);
        // io.sockets.in(roomName)
        //     .emit('init',{data: "game is here"});
        //io.
        // console.log("Client rooms",clientRooms);
        // console.log("Client names",clientNames);

        // previously was io.sockets.in....

        // const res = getKeysByValue(clientRooms,roomName);
        // console.log("clients in room", res);
        //
        // res.forEach((elem) => {
        //     const playerNames: playerNames = {
        //         yourName: clientNames[elem],
        //         opponentName: clientNames[res.filter(sec => sec !== elem)[0]],
        //     }
        //
        //     io.to(elem).emit("gameStart",JSON.stringify(playerNames));
        // });

        // io.in(roomName)
        //     .emit('gameStart');

        state[roomName].players[client.id] = {
            name: infoObject.playerName,
            stack: 1000,
        }

        //console.log("State",state[roomName]);
        prepareForGame(roomName);
    }

    function applyFoldCommand(roomName: string): void {
        if(client.id == state[roomName].currentPlayerTurn) {
            if(validateCommand(roomName,"fold")) {
                handleCommand(roomName,"fold");
            }
        } else {
            return;
        }
        return;
    }

    function applyCallCommand(roomName: string): void {
        if(client.id == state[roomName].currentPlayerTurn) {
            if(validateCommand(roomName,"call")) {
                handleCommand(roomName,"call");
            }
        } else {
            return;
        }
        return;
    }
});

function prepareForGame(roomName: string): void {

    //is it safe to give opponents socket id???
    io.sockets.in(roomName).emit("prepare",JSON.stringify(state[roomName].players));

    //check if mobx change state and render
    // setTimeout(() => {
    //     io.sockets.in(roomName).emit("changeStack",JSON.stringify(500));
    // },5000);

    //console.log("Players",state[roomName].players);

    setTimeout(startPlay,5000,roomName);
}

function startPlay(roomName: string): void {


    state[roomName].currentStage = 0;

    //const objectToSend = { players: { role: undefined, bet: undefined, stack: undefined}, currentBank: 0,};
    const objectToSend = { players: {}, currentBank: 0};
    let isBBAssigned = false;

    Object.keys(state[roomName].players).map( (player, index) => {

        //TODO: WINNING/LOOSING CONDITION
        // if(state[roomName].players[player].stack === 0) {
        //     io.to(player).emit("loose");
        //     return;
        // }

        state[roomName].players[player].cards = pickCards(state[roomName].cardsInPlay,2);
        io.to(player).emit("getCards",JSON.stringify(state[roomName].players[player].cards));
        state[roomName].cardsInPlay = state[roomName].cardsInPlay.concat(state[roomName].players[player].cards);

        state[roomName].players[player].madeTurn = false;

        //TODO: Rotate roles between plays
        //if(state[roomName].currentBet !== BIG_BLIND) {
        if(state[roomName].players[player].role !== Role.BB && isBBAssigned === false) {
            state[roomName].players[player].role = Role.BB;
            state[roomName].players[player].bet = BIG_BLIND;
            state[roomName].players[player].stack -= BIG_BLIND;
            state[roomName].currentBet = BIG_BLIND;
            isBBAssigned = true;
        } else {
            state[roomName].players[player].role = Role.SB;
            state[roomName].players[player].bet = SMALL_BLIND;
            state[roomName].players[player].stack -= SMALL_BLIND;
            state[roomName].currentBank = BIG_BLIND + SMALL_BLIND;
            state[roomName].currentPlayerTurn = player;
        }

        objectToSend.players[player] = {};
        objectToSend.players[player].role = state[roomName].players[player].role;
        objectToSend.players[player].bet = state[roomName].players[player].bet;
        objectToSend.players[player].stack = state[roomName].players[player].stack;
        objectToSend.currentBank = state[roomName].currentBank;
    });


    io.in(roomName).emit("infoUpdate",JSON.stringify(objectToSend));
    startInterval(roomName);

}


function startInterval(roomName: string): void {

    state[roomName].currentTime = TURN_TIME;
    // state[roomName].currentInterval = setInterval(()=>{
    //     if(state[roomName].currentTime === 0) {
    //
    //     }
    //     io.in(roomName).emit("timerUpdate",{});
    //     state[roomName].currentTime--;
    // },1000);

    io.to(state[roomName].currentPlayerTurn).emit("turnOptions",JSON.stringify({actions: calculatePossibleActions(roomName)}));
    state[roomName].currentInterval = setInterval(timerInterval,1000,roomName);

}

function timerInterval(roomName: string): void {

    if(state[roomName].currentTime === 0) {
        clearInterval(state[roomName].currentInterval);
        if(state[roomName].players[state[roomName].currentPlayerTurn].bet < state[roomName].currentBet) {
            handleCommand(roomName,"fold");
        } else {
            handleCommand(roomName,"check");
        }
        return;
    }

    io.in(roomName).emit("timerUpdate",JSON.stringify({currentPlayer: state[roomName].currentPlayerTurn, currentTime: state[roomName].currentTime}));
    state[roomName].currentTime--;
}

function handleCommand(roomName: string, command: string): void {
    const currentPlayer = state[roomName].currentPlayerTurn;

    switch (command) {
        case "fold":
            const objectFoldToSend = { players: {}, message: ""};
            Object.keys(state[roomName].players).map((player) => {
                objectFoldToSend.players[player] = {};

                if(currentPlayer !== player) {
                    state[roomName].players[player].stack += state[roomName].currentBank;
                }

                objectFoldToSend.players[player].stack = state[roomName].players[player].stack;
            })

            state[roomName].currentBank = 0;
            state[roomName].cardsInPlay = [];
            state[roomName].currentStage = 0;

            clearInterval(state[roomName].currentInterval);

            const foldMessage = createMessage("fold",state[roomName].players[currentPlayer].name);
            objectFoldToSend.message = foldMessage;
            io.in(roomName).emit("foldMessage",JSON.stringify(objectFoldToSend));


            setTimeout(() => {
                startPlay(roomName);
            },3000);
            break;

        case "check":
            state[roomName].players[currentPlayer].madeTurn = true;
            clearInterval(state[roomName].currentInterval);
            checkGameState(roomName);
            break;
        case "call":
            state[roomName].players[currentPlayer].madeTurn = true;
            const diff = state[roomName].currentBet - state[roomName].players[currentPlayer].bet;
            state[roomName].currentBank += diff;
            state[roomName].players[currentPlayer].bet = state[roomName].currentBet;
            state[roomName].players[currentPlayer].stack -= diff;

            clearInterval(state[roomName].currentInterval);

            const callMessage = createMessage("call",state[roomName].players[currentPlayer].name);
            const objectCallToSend = {
                bank: state[roomName].currentBank,
                message: callMessage,
                player: {
                    id: currentPlayer,
                    stack: state[roomName].players[currentPlayer].stack,
                    bet: state[roomName].players[currentPlayer].bet,
                }
            }

            io.in(roomName).emit("callMessage",JSON.stringify(objectCallToSend));

            checkGameState(roomName);
            break;
        case "raise":
            state[roomName].players[currentPlayer].madeTurn = true;

            break;
        case "allin":
            state[roomName].players[currentPlayer].madeTurn = true;

            break;
        default:
            break;
    }
}

function checkGameState(roomName: string): void {

    Object.keys(state[roomName].players).map((player) => {
        if(state[roomName].players[player].madeTurn === true) {
            if(state[roomName].players[player].bet < state[roomName].currentBet) {
                state[roomName].currentPlayerTurn = player;
                setTimeout(startInterval,3000,roomName);
            }
        } else {
            state[roomName].currentPlayerTurn = player;
            setTimeout(startInterval,3000,roomName);
        }
    });

    return;
}

function calculatePossibleActions(roomName: string): Actions {
    const actions = {
        call: false,
        raise: false,
        check: false,
        fold: false,
        allin: false,
    }

    const playerBet = state[roomName].players[state[roomName].currentPlayerTurn].bet;
    const playerStack = state[roomName].players[state[roomName].currentPlayerTurn].stack;
    const currentBank = state[roomName].currentBank;
    const currentBet = state[roomName].currentBet;

    if(playerBet === currentBet) {
        actions.check = true;
    } else {
        actions.fold = true;
    }

    if(playerStack <= currentBet - playerBet) {
        actions.allin = true;
    } else {
        actions.raise = true;
        actions.allin = true;
    }

    if(playerBet < currentBet && playerStack >= currentBet - playerBet) {
        actions.call = true;
    }

    return actions;
}

function createMessage(command: string, playerName: string, betValue?: number): string {
    if(betValue == null) {
        return "Player " + playerName + " " + command;
    } else {
        return "Player " + playerName + " " + command + " " + betValue;
    }
}

function validateCommand(roomName: string,command: string, object?: object): boolean {

    const currentPlayer = state[roomName].currentPlayerTurn;

    switch(command) {
        case "fold":
            if(state[roomName].players[currentPlayer].bet < state[roomName].currentBet) {
                return true;
            }
            return false;
        case "check":
            break;
        case "raise":
            break;
        case "allin":
            break;
        case "call":
            if(state[roomName].players[currentPlayer].stack > state[roomName].currentBet - state[roomName].players[currentPlayer].bet &&
                state[roomName].players[currentPlayer].bet < state[roomName].currentBet) {
                return true;
            }
            break;
        default:
            return false;
    }

    return false;
}

io.listen(3001);
