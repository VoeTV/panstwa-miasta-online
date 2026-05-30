import type { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type {
  Room,
  Player,
  ClientToServerEvents,
  ServerToClientEvents,
  RoundAnswers,
  RoundResult,
  FinalResult,
} from "../shared/types.js";
import { DEFAULT_CATEGORIES, POLISH_LETTERS } from "../shared/types.js";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private roundAnswers: Map<string, Map<string, Record<string, string>>> = new Map();
  private usedLetters: Map<string, string[]> = new Map();

  constructor(private io: GameServer) {}

  createRoom(socket: GameSocket, data: { playerName: string; categories?: string[]; maxRounds?: number; timePerRound?: number }) {
    const code = this.generateRoomCode();
    const player: Player = {
      id: socket.id,
      name: data.playerName,
      score: 0,
      isHost: true,
      isReady: false,
      answers: {},
    };

    const room: Room = {
      id: uuidv4(),
      code,
      players: [player],
      state: "lobby",
      currentLetter: "",
      round: 0,
      maxRounds: data.maxRounds || 5,
      timePerRound: data.timePerRound || 60,
      categories: data.categories || DEFAULT_CATEGORIES,
      hostId: socket.id,
    };

    this.rooms.set(code, room);
    this.playerRooms.set(socket.id, code);
    this.usedLetters.set(code, []);
    socket.join(code);

    socket.emit("room:created", room);
    console.log(`[Room] Created: ${code} by ${data.playerName}`);
  }

  joinRoom(socket: GameSocket, data: { code: string; playerName: string }) {
    const code = data.code.toUpperCase();
    const room = this.rooms.get(code);

    if (!room) {
      socket.emit("room:error", "Pokój nie istnieje. Sprawdź kod.");
      return;
    }

    if (room.state !== "lobby") {
      socket.emit("room:error", "Gra już trwa. Poczekaj na następną rundę.");
      return;
    }

    if (room.players.length >= 8) {
      socket.emit("room:error", "Pokój jest pełny (max 8 graczy).");
      return;
    }

    if (room.players.some((p) => p.name === data.playerName)) {
      socket.emit("room:error", "Gracz o tej nazwie już jest w pokoju.");
      return;
    }

    const player: Player = {
      id: socket.id,
      name: data.playerName,
      score: 0,
      isHost: false,
      isReady: false,
      answers: {},
    };

    room.players.push(player);
    this.playerRooms.set(socket.id, code);
    socket.join(code);

    socket.emit("room:joined", room);
    this.io.to(code).emit("player:joined", player);
    this.io.to(code).emit("room:updated", room);

    console.log(`[Room] ${data.playerName} joined ${code}`);
  }

  startGame(socket: GameSocket) {
    const code = this.playerRooms.get(socket.id);
    if (!code) return;

    const room = this.rooms.get(code);
    if (!room || room.hostId !== socket.id) return;

    if (room.players.length < 2) {
      socket.emit("room:error", "Potrzebujesz minimum 2 graczy żeby zacząć.");
      return;
    }

    this.startRound(room);
  }

  private startRound(room: Room) {
    room.round++;
    room.state = "playing";

    const usedLetters = this.usedLetters.get(room.code) || [];
    const availableLetters = POLISH_LETTERS.filter((l) => !usedLetters.includes(l));

    if (availableLetters.length === 0) {
      this.endGame(room);
      return;
    }

    const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    room.currentLetter = letter;
    usedLetters.push(letter);
    this.usedLetters.set(room.code, usedLetters);

    this.roundAnswers.set(room.code, new Map());

    this.io.to(room.code).emit("game:started", { letter, round: room.round });
    this.io.to(room.code).emit("room:updated", room);

    let timeLeft = room.timePerRound;
    const timer = setInterval(() => {
      timeLeft--;
      this.io.to(room.code).emit("game:tick", timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        this.endRound(room);
      }
    }, 1000);

    this.timers.set(room.code, timer);
  }

  submitAnswers(socket: GameSocket, answers: Record<string, string>) {
    const code = this.playerRooms.get(socket.id);
    if (!code) return;

    const roomAnswers = this.roundAnswers.get(code);
    if (!roomAnswers) return;

    roomAnswers.set(socket.id, answers);
  }

  stopRound(socket: GameSocket) {
    const code = this.playerRooms.get(socket.id);
    if (!code) return;

    const room = this.rooms.get(code);
    if (!room || room.state !== "playing") return;

    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      this.io.to(code).emit("player:stop", player.name);
    }

    const timer = this.timers.get(code);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(code);
    }

    this.endRound(room);
  }

  private endRound(room: Room) {
    room.state = "scoring";

    const roomAnswers = this.roundAnswers.get(room.code);
    const allAnswers: RoundAnswers[] = room.players.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      answers: roomAnswers?.get(player.id) || {},
    }));

    this.io.to(room.code).emit("game:round-end");
    this.io.to(room.code).emit("game:scoring", allAnswers);

    const results: RoundResult[] = room.categories.map((category) => {
      const categoryAnswers = allAnswers.map((a) => ({
        playerId: a.playerId,
        playerName: a.playerName,
        answer: (a.answers[category] || "").trim(),
        points: 0,
      }));

      const validAnswers = categoryAnswers.filter(
        (a) => a.answer.length > 0 && a.answer.toUpperCase().startsWith(room.currentLetter)
      );

      const answerCounts = new Map<string, number>();
      validAnswers.forEach((a) => {
        const normalized = a.answer.toLowerCase();
        answerCounts.set(normalized, (answerCounts.get(normalized) || 0) + 1);
      });

      categoryAnswers.forEach((a) => {
        if (a.answer.length === 0 || !a.answer.toUpperCase().startsWith(room.currentLetter)) {
          a.points = 0;
        } else {
          const normalized = a.answer.toLowerCase();
          const count = answerCounts.get(normalized) || 0;
          a.points = count > 1 ? 5 : 10;
        }
      });

      return { category, answers: categoryAnswers };
    });

    results.forEach((result) => {
      result.answers.forEach((answer) => {
        const player = room.players.find((p) => p.id === answer.playerId);
        if (player) {
          player.score += answer.points;
        }
      });
    });

    this.io.to(room.code).emit("game:round-results", results);
    this.io.to(room.code).emit("room:updated", room);

    if (room.round >= room.maxRounds) {
      setTimeout(() => this.endGame(room), 3000);
    }
  }

  nextRound(socket: GameSocket) {
    const code = this.playerRooms.get(socket.id);
    if (!code) return;

    const room = this.rooms.get(code);
    if (!room || room.hostId !== socket.id) return;

    if (room.round >= room.maxRounds) {
      this.endGame(room);
    } else {
      this.startRound(room);
    }
  }

  private endGame(room: Room) {
    room.state = "results";

    const finalResults: FinalResult[] = room.players
      .map((p) => ({
        playerId: p.id,
        playerName: p.name,
        totalScore: p.score,
        roundScores: [],
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    this.io.to(room.code).emit("game:final-results", finalResults);
    this.io.to(room.code).emit("room:updated", room);
  }

  handleDisconnect(socket: GameSocket) {
    const code = this.playerRooms.get(socket.id);
    if (!code) return;

    const room = this.rooms.get(code);
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== socket.id);
    this.playerRooms.delete(socket.id);

    this.io.to(code).emit("player:left", socket.id);

    if (room.players.length === 0) {
      const timer = this.timers.get(code);
      if (timer) clearInterval(timer);
      this.rooms.delete(code);
      this.timers.delete(code);
      this.usedLetters.delete(code);
      console.log(`[Room] Deleted empty room: ${code}`);
    } else {
      if (room.hostId === socket.id) {
        room.hostId = room.players[0].id;
        room.players[0].isHost = true;
      }
      this.io.to(code).emit("room:updated", room);
    }
  }

  private generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code: string;
    do {
      code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    } while (this.rooms.has(code));
    return code;
  }
}
