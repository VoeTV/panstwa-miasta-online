import { useCallback, useRef } from "react";

const SOUNDS = {
  gameStart: "/sfx/game-start.mp3",
  roundEnd: "/sfx/round-end.mp3",
  correctAnswer: "/sfx/correct-answer.mp3",
  tickTock: "/sfx/tick-tock.mp3",
  playerJoin: "/sfx/player-join.mp3",
} as const;

type SoundName = keyof typeof SOUNDS;

export function useSoundEffects() {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const play = useCallback((sound: SoundName) => {
    try {
      let audio = audioRefs.current.get(sound);
      if (!audio) {
        audio = new Audio(SOUNDS[sound]);
        audioRefs.current.set(sound, audio);
      }
      audio.currentTime = 0;
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {
      // Ignore audio errors
    }
  }, []);

  const stop = useCallback((sound: SoundName) => {
    const audio = audioRefs.current.get(sound);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return { play, stop };
}
