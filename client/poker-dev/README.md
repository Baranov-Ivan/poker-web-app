# Texas Holdem Poker Web App ♠️♥️♦️♣️

This poker app is done in terms of [Evolution TypeScript Bootcamp] 2021 graduation project.
This is client folder. Full README.md can be found [here].

## Tech

- [Create React App] - core tech for client app UI
- [TypeScript] - typed JavaScript power
- [MobX] - state manager for reactive client view

## Installation

You can clone this repository and run client app locally on your machine.
Or try in online: https://poker-web-app.netlify.app/

After cloning this repo, if you want to run this app with local server, you need to find the line with this code ```socket = socketIOClient("https://frozen-mesa-84164.herokuapp.com/", {``` , comment it
and uncomment line ```socket = socketIOClient("http://localhost:3001", {``` in the file ```socket.ts```
Then open the terminal and run these commands.

For client:
```sh
cd client\poker-dev
npm install
npm start
```
This will run app in dev mode, but you can access it in browser with ```http://localhost:3000/```
Client app is running on ```localhost:3000``` and local server is listening on ```localhost:3001```

[Create React App]: <https://create-react-app.dev/>
[TypeScript]: <https://www.typescriptlang.org/>
[MobX]: <https://mobx.js.org/README.html>
[Node.js]: <https://nodejs.org/en/>
[Evolution TypeScript Bootcamp]: <https://typescript-bootcamp.evolution.com/by>
[here]: <https://github.com/Baranov-Ivan/poker-web-app/blob/main/README.md>