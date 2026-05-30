# 🌍 Państwa i Miasta Online

Multiplayer online game — play "Countries and Cities" with friends in real-time.

## Features

- 🎮 **Real-time multiplayer** — create rooms and invite friends with a 5-letter code
- ⚡ **Live gameplay** — Socket.IO powered instant communication
- 🎵 **AI Sound Effects** — generated with ElevenLabs
- 📊 **Auto-scoring** — unique answers = 10pts, duplicates = 5pts, invalid = 0pts
- 🎨 **Modern UI** — dark theme, responsive, Tailwind CSS
- 🏆 **Leaderboard** — track scores across rounds

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS (hosted on Cloudflare Pages)
- **Backend:** Node.js + Express + Socket.IO (hosted on Render)
- **Sound Effects:** ElevenLabs AI

## Deployment

### Backend (Render)

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repo `VoeTV/panstwa-miasta-online`
3. Settings:
   - **Build Command:** `npm install && npm run build:server`
   - **Start Command:** `node dist/server/index.js`
   - **Environment:** Node
4. After deploy, copy the URL (e.g. `https://panstwa-miasta-online.onrender.com`)

### Frontend (Cloudflare Pages)

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) and create a new project
2. Connect your GitHub repo `VoeTV/panstwa-miasta-online`
3. Build settings:
   - **Framework preset:** None
   - **Build command:** `npm install && npm run build:client`
   - **Build output directory:** `dist/client`
4. Add environment variable:
   - `VITE_SERVER_URL` = your Render backend URL (e.g. `https://panstwa-miasta-online.onrender.com`)
5. Deploy

## Local Development

```bash
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## How to Play

1. Enter your nickname
2. Create a room or join with a code
3. Share the room code with friends
4. Host starts the game — a random letter appears
5. Fill in all categories starting with that letter
6. Click STOP when done (or wait for timer)
7. Points are awarded automatically
8. Most points after all rounds wins!

## Categories

- Państwo (Country)
- Miasto (City)
- Imię (Name)
- Zwierzę (Animal)
- Roślina (Plant)
- Rzecz (Thing)

## Sound Effects

Generated with ElevenLabs AI. Regenerate with:
```bash
ELEVENLABS_API_KEY=your_key npm run generate-sfx
```

## License

MIT
