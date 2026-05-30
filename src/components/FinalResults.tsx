import type { Socket } from "socket.io-client";
import type { FinalResult, ClientToServerEvents, ServerToClientEvents } from "../../shared/types";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface Props {
  results: FinalResult[];
  socket: GameSocket | null;
}

export function FinalResults({ results }: Props) {
  const handlePlayAgain = () => { window.location.reload(); };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-lg w-full text-center">
        <h2 className="text-3xl font-bold mb-2">\ud83c\udfc6 Koniec gry!</h2>
        <p className="text-gray-400 mb-8">Oto wyniki ko\u0144cowe</p>
        <div className="space-y-3 mb-8">
          {results.map((result, index) => (
            <div key={result.playerId} className={`flex items-center justify-between p-4 rounded-xl ${index === 0 ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30" : index === 1 ? "bg-gray-700/50 border border-gray-600/30" : index === 2 ? "bg-orange-900/20 border border-orange-700/30" : "bg-gray-800/50"}`}>
              <div className="flex items-center gap-4">
                <div className="text-3xl">{index === 0 ? "\ud83e\udd47" : index === 1 ? "\ud83e\udd48" : index === 2 ? "\ud83e\udd49" : `#${index + 1}`}</div>
                <div className="text-left"><div className="font-bold text-lg">{result.playerName}</div></div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-400">{result.totalScore}</div>
                <div className="text-xs text-gray-400">punkt\u00f3w</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handlePlayAgain} className="btn-primary w-full text-lg">\ud83d\udd04 Zagraj ponownie</button>
      </div>
    </div>
  );
}
