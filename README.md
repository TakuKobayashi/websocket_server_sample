# Websocket Server Sample

This is a sample project to connect with other users using Websocket.
If you want to introduce two-way communication using Websocket, this project will be helpful.
Japanese document is [here](./doc/README.jp.md)

# Trial global connection server

If you want to check connection and communication using Websocket, please use the following website.
https://takukobayashi.github.io/websocket_server_sample/

This website is a sample chat.
So, while you open this website, you can see the message sent by others and also you can send the message to others.
If you want to connect using Websocket, use the following url to connect.

```
wss://websocketsample-278018.dt.r.appspot.com/
```

# Wakeup Local Server

If you want to wake up the local server, use this project.

1. Download this project.
2. Install Node.js.
3. Execute folling command.

```
npm install
```

4. Execute folling command and wake up local server.

```
./node_modules/nodemon/bin/nodemon.js index.js
```

5. Open http://localhost:3000
You can do the same in your local.
After, edit this project as you like the source code.
