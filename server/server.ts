import {Server} from "socket.io";
import {makeId} from "./utils";
import {JoinState} from "./types";

//const io: Server = require('socket.io')();

const state = {};
const clientRooms = {};

const httpServer = require("http").createServer();
// const io: Server = require('socket.io')(httpServer, {
//     cors: {
//         origin: "http://127.0.0.1:8080",
//         methods: ["GET", "POST"],
//         credentials: true,
//         transports: ['websocket', 'polling']
//     },
//     allowEIO3: true
// });
const io = require('socket.io')(httpServer, {
    //origins: ["http://localhost:3000" , "http://localhost:3002"],
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling']
    },
    allowEIO3: true
});

// const io: Server = new Server(httpServer, {
//     cors: {
//
//     }
// });
// const io = require('socket.io')();
//
// io.set('origins','*:*');
//
io.on('connection', client => {
    client.emit('init', {data: "hello world"});

    client.on("newGame", handleNewGame);
    client.on("joinGame", handleJoinGame);

    function handleNewGame(playerName: string): void {
        let roomName = makeId(5);
        clientRooms[client.id] = roomName;
        client.emit("gameCode", roomName);

        //тут инициализируется начальный state для партии??
        //state[roomName] = some function

        client.join(roomName);
        client.number = 1;
        client.name = playerName;
        client.emit("init", 1);
    }

    function handleJoinGame(infoForJoin: string): void {
        const infoObject: JoinState = JSON.parse(infoForJoin);
        //console.log(infoObject);
        const roomName = infoObject.gameCode;
        console.log(roomName);
        //const room = io.sockets.adapter.rooms[roomName];
        const room = io.sockets.adapter.rooms.get(roomName);

        clientRooms[client.id] = roomName;
        // console.log("Current user",client.id);
        // console.log(io.sockets.adapter.rooms);
        console.log("Room",room);
        console.log("Client",client.id);
        //console.log(Object.getOwnPropertyNames(io.sockets.adapter.rooms));
        let allUsers;

        let numClients = 0;

        if(room) {
            //allUsers = room.get(roomName);
            //console.log("AllUsers",allUsers);
            numClients = room.size;
        }

        //let numClients = 0;
        // if(allUsers) {
        //     numClients = allUsers.size;
        // }

        if(numClients === 0) {
            //client.emit("unknownCode");
            return;
        } else if (numClients > 1) {
            //client.emit("tooManyPlayers");
            return;
        }

        clientRooms[client.id] = roomName;
        client.join(roomName);
        client.number = 2;
        client.playerName = infoObject.playerName;
        //startGameInterval(roomName);
        console.log("Aftermath",io.sockets.adapter.rooms.get(roomName));
        console.log("Current rooms",io.sockets.adapter.rooms);
        console.log("Current rooms length",io.sockets.adapter.rooms.size);
        io.sockets.in(roomName)
            .emit('init',{data: "game is here"});
        //io.to(client.id).emit('init',"shhhh");
        //io.
    }
});

io.listen(3001);