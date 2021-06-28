import React, {useEffect} from "react";
import { observer } from "mobx-react-lite";
import socketIOClient from "socket.io-client";
import { useStore } from "../store/store";
const ENDPOINT = "http://localhost:3000";

export const HomeScreen = observer(() => {
    const player = useStore("Player");
    const socket = useStore("Socket");

    const onCreateClick = () => {
        player.showName();
        socket.handleCreateGame(player.name);
    }

    const onJoinClick = () => {
        player.showName();
        socket.handleJoinGame(player.name);
    }

    const handleNameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        //By default, it is not allowed to change the state outside of actions
        //player.name = event.target.value;
        player.handleStoreNameChange(event.target.value);
    },[]);

    const handleCodeChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        //By default, it is not allowed to change the state outside of actions
        //socket.gameCode = event.target.value;
        socket.handleStoreCodeChange(event.target.value);
    },[]);
    // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     player.name = event.target.value;
    // }

    // useEffect(() => {
    //     const socket = socketIOClient(ENDPOINT,{
    //         withCredentials: true
    //     });
    //
    //     socket.on("init", handleInit);
    // });

    return (
      <div>
          <label>Name
            <input placeholder={"Your name"} onChange={handleNameChange}></input>
          </label>
          <p></p>
          <button onClick={onCreateClick}>Create new game</button>
          <p>OR</p>
          <p>Join existing game</p>
          <input placeholder={'Code'} onChange={handleCodeChange}></input>
          <button onClick={onJoinClick}>Join</button>
      </div>
    );
});