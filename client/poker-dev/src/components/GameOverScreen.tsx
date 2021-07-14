import React from "react";

interface GameOverProps {
    message: string;
}

export const GameOverScreen = ({message} : GameOverProps): JSX.Element =>  {
    return <>
        <h1>{message}</h1>
    </>
}