# Texas Hold 'em Poker Web App ♠️♥️♦️♣️

This poker app is done in terms of [Evolution TypeScript Bootcamp] 2021 graduation project.

## Features
 - Online multiplayer for two players
 - Full data consistency between client and server
 - Server can handle multiple games simultaneously

## Tech

 - [Create React App] - core tech for client app UI
 - [TypeScript] - typed JavaScript power
 - [MobX] - state manager for reactive client view
 - [Node.js] - JavaScript runtime, heart of server
 - [Socket.IO] - JavaScript library for handling client-server communication
 - [Poker API] - JSON poker API for calculating the winning hand
  
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

For server:
```sh
cd server
npm install
npx ts-node src/server.ts
```

Client app is running on ```localhost:3000``` and server is listening on ```localhost:3001```

## Usage

First thing you see is screen where you can create new game or connect to already created game.
For creating new game, type in your nickname and hit "Create" button.

[![image.png](https://i.postimg.cc/xCR1c20R/image.png)](https://postimg.cc/S2nhvHY2)

Then you reach waiting screen, where you can acquire the game code, that is needed for joining your game.

[![image.png](https://i.postimg.cc/bJCf7NyK/image.png)](https://postimg.cc/TLDsmxW9)

For joining game, you also need to type in your nickname and the game code, which is provided by another player.Then hit "Join" button.
Then the game starts. The game screen consists of few elements described on the next screenshot:

[![players.png](https://i.postimg.cc/gj17qxsH/players.png)](https://postimg.cc/m1NVT20P)

Game rules are the same as for classic Texas Hold 'em No Limit Poker. You can read them on [wikipedia].
Some exceptions: 
 - You can bet and raise any amount that is bigger than other bet (i.e. bet is not hardly tied on other bets, when your re-raise must be at least the amount of previous raise).
 - Multiple raises by one player is allowed in one round. 

This behaviour might be changed later.

The game continues until one of the players get all points. He is considered as winner. Another player loses. Then the game ends and players get to title screen, where they can begin another game.

## Further development ideas
 - 💡 Extend both client and server for handling more than two players
 - 💡 Better poker rules (for example, betting rules, as described above, adding ante etc.)
 - 💡 Better visuals and animations
 - 💡 Ability to reconnect
 - 💡 Lobby with game selection
 - 💡 Settings for game customization (blinds rate, ante, amount of players etc.)
 - 💡 Cover code with unit tests

## Known issues
 - ❌ Server is not handling the case when several players with equal hands can be winners
 - ❌ In some cases client and server betting commands don't match and server can't validate some commands from client
 - ❌ In some cases all-in state is not triggered when one of the players already has 0 stack

Feel free to leave any comments and report issues on current project code and state.

## License
 THIS PROJECT IS DONE FOR EDUCATIONAL PURPOSE ONLY. NOT FOR COMMERCIAL USE.
 
 All images used in this app are license free. Card images dowloaded from [ACBL Resource Center].
 
 Ivan Baranau | Evolution TypeScript Bootcamp 2021 

 [Create React App]: <https://create-react-app.dev/>
 [TypeScript]: <https://www.typescriptlang.org/>
 [MobX]: <https://mobx.js.org/README.html>
 [Node.js]: <https://nodejs.org/en/>
 [Socket.IO]: <https://socket.io/>
 [Poker API]: <https://www.pokerapi.dev/>
 [ACBL Resource Center]: <http://acbl.mybigcommerce.com/52-playing-cards/>
 [Evolution TypeScript Bootcamp]: <https://typescript-bootcamp.evolution.com/by>
 [wikipedia]: <https://en.wikipedia.org/wiki/Texas_hold_%27em>