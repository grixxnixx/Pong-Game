const { createServer } = require("node:http");
const path = require("path");

const express = require("express");
const { Server } = require("socket.io");
const compression = require("compression");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);

app.use(compression());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

let readyPlayerCount = 0;

const pongNameSpace = io.of("/pong");

pongNameSpace.on("connection", (socket) => {
  let room;
  socket.on("ready", () => {
    room = "room" + Math.floor(readyPlayerCount / 2);
    socket.join(room);

    console.log("Player ready", socket.id, room);
    readyPlayerCount++;

    if (readyPlayerCount % 2 === 0) {
      pongNameSpace.in(room).emit("startGame", socket.id);
    }
  });

  socket.on("paddleMove", (paddleData) => {
    socket.to(room).emit("paddleMove", paddleData);
  });
  socket.on("ballMove", (ballMoveData) => {
    socket.to(room).emit("ballMove", ballMoveData);
  });
});

const PORT = 4000;

httpServer.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
