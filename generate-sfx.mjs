import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { writeFileSync } from "node:fs";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const effects = [
  {
    name: "game-start",
    prompt: "Short energetic arcade game start jingle with a rising synth tone and a punchy kick, modern and clean",
    duration: 2,
  },
  {
    name: "round-end",
    prompt: "Quick buzzer sound effect like a game show timer running out, short electronic buzz",
    duration: 1.5,
  },
  {
    name: "correct-answer",
    prompt: "Short positive confirmation chime, bright and glassy, like a correct answer in a quiz game",
    duration: 1,
  },
  {
    name: "tick-tock",
    prompt: "Tense ticking clock sound, steady rhythm, suspenseful game timer tick",
    duration: 3,
  },
  {
    name: "player-join",
    prompt: "Short soft notification pop sound, friendly and modern, like someone joining a chat room",
    duration: 0.8,
  },
];

for (const effect of effects) {
  console.log(`Generowanie: ${effect.name}...`);
  try {
    const response = await client.textToSoundEffects.convert({
      text: effect.prompt,
      durationSeconds: effect.duration,
      promptInfluence: 0.7,
    });

    const chunks = [];
    for await (const chunk of response) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    writeFileSync(`public/sfx/${effect.name}.mp3`, buffer);
    console.log(`  \u2713 ${effect.name}.mp3 (${(buffer.length / 1024).toFixed(1)} KB)`);
  } catch (error) {
    console.error(`  \u2717 ${effect.name}: ${error.message}`);
    if (error.body) console.error(`    ${JSON.stringify(error.body)}`);
  }
}

console.log("\nGotowe!");
