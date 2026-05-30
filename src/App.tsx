import { useState, useEffect } from "react";
import { useSocket } from "./hooks/useSocket";
import { useSoundEffects } from "./hooks/useSoundEffects";
import { HomeScreen } from "./components/HomeScreen";
import { Lobby } from "./components/Lobby";
import { GameRound } from "./components/GameRound";
import { RoundResults } from "./components/RoundResults";
import { FinalResults } from "./components/FinalResults";
import type { Room, RoundAnswers, RoundResult, FinalResult } from "../shared/types";

type Screen = "home" | "lobby" | "playing" | "scoring" | "results";

export function App() {
  const { socket, isConnected } = useSocket();
  const { play, stop } = useSoundEffects();
  const [screen, setScreen] = useState<Screen>("home");
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [currentLetter, setCurrentLetter] = useState("");
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundAnswers, setRoundAnswers] = useState<RoundAnswers[]>([]);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [finalResults, setFinalResults] = useState<FinalResult[]>([]);
  const [stoppedBy, setStoppedBy] = useState("");

  useEffect(() => {
    if (!socket) return;

    socket.on("room:created", (r) => { setRoom(r); setScreen("lobby"); setError(""); });
    socket.on("room:joined", (r) => { setRoom(r); setScreen("lobby"); setError(""); play("playerJoin"); });
    socket.on("room:updated", (r) => { setRoom(r); });
    socket.on("room:error", (msg) => { setError(msg); });
    socket.on("player:joined", () => { play("playerJoin"); });
    socket.on("game:started", ({ letter, round }) => { setCurrentLetter(letter); setCurrentRound(round); setScreen("playing"); setStoppedBy(""); play("gameStart"); });
    socket.on("game:tick", (time) => { setTimeLeft(time); if (time === 10) play("tickTock"); });
    socket.on("game:round-end", () => { stop("tickTock"); play("roundEnd"); });
    socket.on("game:scoring", (answers) => { setRoundAnswers(answers); setScreen("scoring"); });
    socket.on("game:round-results", (results) => { setRoundResults(results); });
    socket.on("game:final-results", (results) => { setFinalResults(results); setScreen("results"); });
    socket.on("player:stop", (playerName) => { setStoppedBy(playerName); });

    return () => {
      socket.off("room:created"); socket.off("room:joined"); socket.off("room:updated");
      socket.off("room:error"); socket.off("player:joined"); socket.off("game:started");
      socket.off("game:tick"); socket.off("game:round-end"); socket.off("game:scoring");
      socket.off("game:round-results"); socket.off("game:final-results"); socket.off("player:stop");
    };
  }, [socket, play, stop]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Łączenie z serwerem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce-in">
          {error}
          <button onClick={() => setError("")} className="ml-3 font-bold">✕</button>
        </div>
      )}
      {screen === "home" && <HomeScreen socket={socket} />}
      {screen === "lobby" && room && <Lobby room={room} socket={socket} />}
      {screen === "playing" && room && <GameRound room={room} socket={socket} letter={currentLetter} round={currentRound} timeLeft={timeLeft} stoppedBy={stoppedBy} />}
      {screen === "scoring" && room && <RoundResults room={room} socket={socket} answers={roundAnswers} results={roundResults} round={currentRound} letter={currentLetter} />}
      {screen === "results" && <FinalResults results={finalResults} socket={socket} />}
    </div>
  );
}
