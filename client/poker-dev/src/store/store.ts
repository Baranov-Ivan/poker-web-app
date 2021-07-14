import { createContext } from "../utils/storeUtils";
import {Socket} from "./socket";
import {Controller} from "./controller";
import {Game} from "./game";
import {Players} from "./players";

const socket = new Socket();

export const { StoreProvider, useStore } = createContext({
    Controller: new Controller(socket),
    Game: new Game(socket),
    Players: new Players(socket),
});