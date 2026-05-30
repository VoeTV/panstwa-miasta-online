export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  answers: Record<string, string>;
}

export interface Room {
  id: string;
  code: string;
  players: Player[];
  state: GameState;
  currentLetter: string;
  round: number;
  maxRounds: number;
  timePerRound: number;
  categories: string[];
  hostId: string;
}

export type GameState = "lobby" | "playing" | "scoring" | "results";

export interface RoundAnswers {
  playerId: string;
  playerName: string;
  answers: Record<string, string>;
}

export interface RoundResult {
  category: string;
  answers: { playerId: string; playerName: string; answer: string; points: number }[];
}

export interface FinalResult {
  playerId: string;
  playerName: string;
  totalScore: number;
  roundScores: number[];
}

export interface ServerToClientEvents {
  "room:created": (room: Room) => void;
  "room:joined": (room: Room) => void;
  "room:updated": (room: Room) => void;
  "room:error": (message: string) => void;
  "game:started": (data: { letter: string; round: number }) => void;
  "game:tick": (timeLeft: number) => void;
  "game:round-end": () => void;
  "game:scoring": (answers: RoundAnswers[]) => void;
  "game:round-results": (results: RoundResult[]) => void;
  "game:final-results": (results: FinalResult[]) => void;
  "player:joined": (player: Player) => void;
  "player:left": (playerId: string) => void;
  "player:stop": (playerName: string) => void;
}

export interface ClientToServerEvents {
  "room:create": (data: { playerName: string; categories?: string[]; maxRounds?: number; timePerRound?: number }) => void;
  "room:join": (data: { code: string; playerName: string }) => void;
  "game:start": () => void;
  "game:submit-answers": (answers: Record<string, string>) => void;
  "game:stop": () => void;
  "game:score-answers": (scores: Record<string, Record<string, number>>) => void;
  "game:next-round": () => void;
}

export const DEFAULT_CATEGORIES = [
  "Pa\u0144stwo",
  "Miasto",
  "Imi\u0119",
  "Zwierz\u0119",
  "Ro\u015blina",
  "Rzecz",
];

export const POLISH_LETTERS = "ABCDEFGHIJKL\u0141MNOPRSTUWZ\u017b".split("");
