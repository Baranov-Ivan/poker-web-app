import socketIOClient from "socket.io-client";

//const SERVER = "http://localhost:3001";
const SERVER = "https://frozen-mesa-84164.herokuapp.com/";

export class Socket {
    socket = socketIOClient(SERVER, {
        //withCredentials: true,
        withCredentials: false,
        transports: ["websocket"],
    });
}
