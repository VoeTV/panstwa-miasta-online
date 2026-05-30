import { useState } from "react";
import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "../../shared/types";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface Props {
  socket: GameSocket | null;
}

export function HomeScreen({ socket }: Props) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");

  const handleCreate = () => {
    if (!socket || !playerName.trim()) return;
    socket.emit("room:create", { playerName: playerName.trim() });
  };

  const handleJoin = () => {
    if (!socket || !playerName.trim() || !roomCode.trim()) return;
    socket.emit("room:join", { code: roomCode.trim().toUpperCase(), playerName: playerName.trim() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-game-accent bg-clip-text text-transparent">
          🌍 Państwa i Miasta
        </h1>
        <p className="text-gray-400 mb-8">Graj online ze znajomymi</p>

        {mode === "menu" && (
          <div className="space-y-4">
            <input type="text" placeholder="Twój nick..." value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="input-field text-center text-lg" maxLength={20} />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => playerName.trim() && setMode("create")} className="btn-primary" disabled={!playerName.trim()}>🎮 Stwórz pokój</button>
              <button onClick={() => playerName.trim() && setMode("join")} className="btn-accent" disabled={!playerName.trim()}>🚪 Dołącz</button>
            </div>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-4 animate-bounce-in">
            <p className="text-gray-300">Grasz jako: <span className="font-bold text-primary-400">{playerName}</span></p>
            <button onClick={handleCreate} className="btn-primary w-full text-lg">🚀 Stwórz nowy pokój</button>
            <button onClick={() => setMode("menu")} className="text-gray-400 hover:text-white transition">← Wróć</button>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-4 animate-bounce-in">
            <p className="text-gray-300">Grasz jako: <span className="font-bold text-primary-400">{playerName}</span></p>
            <input type="text" placeholder="Kod pokoju (np. ABC12)" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} className="input-field text-center text-2xl tracking-widest font-mono" maxLength={5} />
            <button onClick={handleJoin} className="btn-accent w-full text-lg" disabled={roomCode.length < 5}>🚪 Dołącz do pokoju</button>
            <button onClick={() => setMode("menu")} className="text-gray-400 hover:text-white transition">← Wróć</button>
          </div>
        )}
      </div>
    </div>
  );
}
