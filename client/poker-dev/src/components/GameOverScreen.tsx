import React from "react";

interface GameOverProps {
    message: string;
}

export const GameOverScreen = ({ message }: GameOverProps): JSX.Element => {
    return (
        <>
            <div className={"gameover-message"}>{message}</div>
        </>
    );
};
