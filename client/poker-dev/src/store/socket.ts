import socketIOClient from "socket.io-client";

export class Socket {
    socket = socketIOClient("http://localhost:3001", {
        withCredentials: true,
    });
}
