import type { Socket } from "socket.io-client";
import type { Room, RoundAnswers, RoundResult, ClientToServerEvents, ServerToClientEvents } from "../../shared/types";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface Props {
  room: Room;
  socket: GameSocket | null;
  answers: RoundAnswers[];
  results: RoundResult[];
  round: number;
  letter: string;
}

export function RoundResults({ room, socket, answers, results, round, letter }: Props) {
  const isHost = socket?.id === room.hostId;
  const hasResults = results.length > 0;

  const handleNextRound = () => { socket?.emit("game:next-round"); };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-4 text-center">
        <h2 className="text-2xl font-bold mb-1">Wyniki rundy {round} — litera "{letter}"</h2>
        <p className="text-gray-400">{hasResults ? "Punktacja automatyczna" : "Sprawdzanie odpowiedzi..."}</p>
      </div>

      {hasResults && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400">Kategoria</th>
                {room.players.map((player) => <th key={player.id} className="text-center py-2 px-3 text-gray-400">{player.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.category} className="border-b border-gray-800">
                  <td className="py-3 px-3 font-medium text-game-accent">{result.category}</td>
                  {room.players.map((player) => {
                    const answer = result.answers.find((a) => a.playerId === player.id);
                    return (
                      <td key={player.id} className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={answer?.answer ? "text-white" : "text-gray-600"}>{answer?.answer || "—"}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${answer?.points === 10 ? "bg-green-500/20 text-green-400" : answer?.points === 5 ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-700 text-gray-500"}`}>+{answer?.points || 0}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-center gap-6">
              {room.players.sort((a, b) => b.score - a.score).map((player, i) => (
                <div key={player.id} className="text-center">
                  <div className="text-lg font-bold">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""} {player.name}</div>
                  <div className="text-2xl font-bold text-primary-400">{player.score} pkt</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasResults && isHost && <div className="text-center mt-6"><button onClick={handleNextRound} className="btn-primary text-lg">{round >= room.maxRounds ? "🏆 Pokaż wyniki końcowe" : "➡️ Następna runda"}</button></div>}
      {hasResults && !isHost && <div className="text-center mt-6 text-gray-400">Czekam aż host przejdzie dalej...</div>}
    </div>
  );
}
