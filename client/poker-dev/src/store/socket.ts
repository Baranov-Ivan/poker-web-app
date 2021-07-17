import socketIOClient from "socket.io-client";

export class Socket {
    //socket = socketIOClient("http://localhost:3001", {
    socket = socketIOClient("https://frozen-mesa-84164.herokuapp.com/", {
        //withCredentials: true,
        withCredentials: false,
        transports: ["websocket"],
    });
}
