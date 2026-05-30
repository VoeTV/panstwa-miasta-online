import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { GameManager } from "./GameManager.js";
import type { ClientToServerEvents, ServerToClientEvents } from "../shared/types.js";

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const gameManager = new GameManager(io);

io.on("connection", (socket) => {
  console.log(`[+] Player connected: ${socket.id}`);

  socket.on("room:create", (data) => {
    gameManager.createRoom(socket, data);
  });

  socket.on("room:join", (data) => {
    gameManager.joinRoom(socket, data);
  });

  socket.on("game:start", () => {
    gameManager.startGame(socket);
  });

  socket.on("game:submit-answers", (answers) => {
    gameManager.submitAnswers(socket, answers);
  });

  socket.on("game:stop", () => {
    gameManager.stopRound(socket);
  });

  socket.on("game:next-round", () => {
    gameManager.nextRound(socket);
  });

  socket.on("disconnect", () => {
    console.log(`[-] Player disconnected: ${socket.id}`);
    gameManager.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🎮 Państwa i Miasta server running on port ${PORT}`);
});
