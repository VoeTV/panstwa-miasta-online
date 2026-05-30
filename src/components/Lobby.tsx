import type { Socket } from "socket.io-client";
import type { Room, ClientToServerEvents, ServerToClientEvents } from "../../shared/types";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface Props {
  room: Room;
  socket: GameSocket | null;
}

export function Lobby({ room, socket }: Props) {
  const isHost = socket?.id === room.hostId;

  const handleStart = () => {
    socket?.emit("game:start");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-lg w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Poczekalnia</h2>
          <div className="bg-gray-800 rounded-xl p-4 inline-block">
            <p className="text-sm text-gray-400 mb-1">Kod pokoju:</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-game-accent">{room.code}</p>
          </div>
          <p className="text-sm text-gray-400 mt-2">Podaj ten kod znajomym</p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Gracze ({room.players.length}/8)</h3>
          <div className="space-y-2">
            {room.players.map((player) => (
              <div key={player.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">{player.name[0].toUpperCase()}</div>
                  <span className="font-medium">{player.name}</span>
                </div>
                {player.isHost && <span className="text-xs bg-game-accent/20 text-game-accent px-2 py-1 rounded-full font-semibold">👑 Host</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-3">
          <div className="text-sm text-gray-400">{room.maxRounds} rund • {room.timePerRound}s na rundę • {room.categories.length} kategorii</div>
          {isHost ? (
            <button onClick={handleStart} className="btn-primary w-full text-lg" disabled={room.players.length < 2}>
              {room.players.length < 2 ? "Czekam na graczy..." : `🎮 Rozpocznij grę (${room.players.length} graczy)`}
            </button>
          ) : (
            <div className="bg-gray-800 rounded-xl p-4"><p className="text-gray-300">Czekam aż host rozpocznie grę...</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
