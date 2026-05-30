import { useState, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import type { Room, ClientToServerEvents, ServerToClientEvents } from "../../shared/types";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface Props {
  room: Room;
  socket: GameSocket | null;
  letter: string;
  round: number;
  timeLeft: number;
  stoppedBy: string;
}

export function GameRound({ room, socket, letter, round, timeLeft, stoppedBy }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    setAnswers({});
    const firstInput = inputRefs.current.get(room.categories[0]);
    firstInput?.focus();
  }, [letter, round, room.categories]);

  useEffect(() => {
    socket?.emit("game:submit-answers", answers);
  }, [answers, socket]);

  const handleChange = (category: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [category]: value }));
  };

  const handleStop = () => { socket?.emit("game:stop"); };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const nextCategory = room.categories[index + 1];
      if (nextCategory) inputRefs.current.get(nextCategory)?.focus();
    }
  };

  const timerColor = timeLeft <= 10 ? "text-red-500" : timeLeft <= 30 ? "text-game-accent" : "text-green-400";
  const timerWidth = (timeLeft / room.timePerRound) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-400">Runda {round}/{room.maxRounds}</div>
          <div className={`text-2xl font-mono font-bold ${timerColor}`}>{timeLeft}s</div>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000 ease-linear rounded-full" style={{ width: `${timerWidth}%` }} />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-1">Litera:</p>
          <div className="inline-block bg-primary-600 text-white text-5xl font-bold w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg">{letter}</div>
        </div>
        {stoppedBy && <div className="mt-3 text-center text-game-accent font-semibold animate-bounce-in">⚡ {stoppedBy} kliknął STOP!</div>}
      </div>

      <div className="card">
        <div className="space-y-3">
          {room.categories.map((category, index) => (
            <div key={category} className="flex items-center gap-3">
              <label className="w-24 text-sm font-medium text-gray-400 text-right shrink-0">{category}</label>
              <input
                ref={(el) => { if (el) inputRefs.current.set(category, el); }}
                type="text"
                placeholder={`${category} na "${letter}"...`}
                value={answers[category] || ""}
                onChange={(e) => handleChange(category, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="input-field"
                autoComplete="off"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button onClick={handleStop} className="btn-danger text-lg px-10">✋ STOP</button>
          <p className="text-xs text-gray-500 mt-2">Kliknij gdy wypełnisz wszystkie pola</p>
        </div>
      </div>
    </div>
  );
}
