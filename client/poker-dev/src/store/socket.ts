import socketIOClient from "socket.io-client";

export class Socket {
    //socket = socketIOClient("http://localhost:3001", {
    socket = socketIOClient("https://poker-web-app-old.herokuapp.com/", {
        //withCredentials: true,
        withCredentials: false,
        transports: ["websocket"],
    });
}
