import { createContext } from "../utils/storeUtils";
import {Player} from "./player";
import {Socket} from "./socket";

export const { StoreProvider, useStore } = createContext({
    Player: new Player(),
    Socket: new Socket(),
});