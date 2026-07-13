# WorstFriend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an online multiplayer version of "Amigos de Merda" — a social voting card game where players vote on who best fits a question, first to N cards wins.

**Architecture:** Custom Node.js HTTP server wrapping Next.js 15 + Socket.IO on port 3000. Server-authoritative game state in memory (Map). No database, no auth. Pure TypeScript game engine decoupled from network/UI.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5.8, Socket.IO 4.7, Zustand 4.5, Tailwind CSS 4, Vitest, tsx

**Reference:** NoWay project at `D:\01 - Works\Otavio\NoWay` for patterns

---

## File Map

| File | Responsibility |
|------|---------------|
| `server.mts` | HTTP + Socket.IO entry point |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript config |
| `tsconfig.server.json` | Server-side TS config |
| `next.config.js` | Next.js config |
| `postcss.config.js` | PostCSS with Tailwind |
| `vitest.config.ts` | Vitest config |
| `src/cards/data.ts` | 84 game cards |
| `src/game-engine/types.ts` | Player, Card, Room, Round, Vote types |
| `src/game-engine/deck.ts` | Shuffle + draw |
| `src/game-engine/room.ts` | Room CRUD, host transfer |
| `src/game-engine/round.ts` | Voting, reveal, resolve winner/tie |
| `src/game-engine/game.ts` | Orchestrate rounds, check win |
| `src/game-engine/scoring.ts` | Rank players by cardsWon |
| `src/server/rooms.ts` | In-memory room storage + socket mapping |
| `src/server/socket.ts` | All Socket.IO event handlers |
| `src/lib/socket.ts` | Socket.IO client singleton |
| `src/lib/store.ts` | Zustand global state + listeners |
| `src/app/globals.css` | Tailwind theme (NoWay palette) |
| `src/app/layout.tsx` | Root layout |
| `src/app/page.tsx` | Home page (create/join) |
| `src/app/sala/[id]/page.tsx` | Lobby (waiting room) |
| `src/app/jogo/[id]/page.tsx` | Game page |
| `src/components/card-display.tsx` | Card question + round info |
| `src/components/game-board.tsx` | Main game orchestrator |
| `src/components/player-grid.tsx` | Player avatars + scores |
| `src/components/vote-panel.tsx` | Voting buttons + timer |
| `src/components/vote-reveal.tsx` | Reveal animation |
| `src/components/game-result.tsx` | Crown screen + ranking |
| `src/components/rules-modal.tsx` | Rules overlay |
| `src/tests/setup.ts` | Vitest setup |
| `src/tests/game-engine/*` | Unit tests |
| `tests/e2e/*` | E2E tests |

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.server.json`
- Create: `next.config.js`
- Create: `postcss.config.js`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `public/crown.svg`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "worstfriend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=18" },
  "scripts": {
    "dev": "tsx server.mts",
    "build": "next build --turbo",
    "start": "NODE_ENV=production tsx server.mts",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "next lint"
  },
  "dependencies": {
    "@tailwindcss/postcss": "^4.3.2",
    "lucide-react": "^0.500.0",
    "next": "15.5.20",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^26.1.1",
    "@types/react": "^19.2.17",
    "@vitejs/plugin-react": "^6.0.3",
    "autoprefixer": "^10.5.2",
    "jsdom": "^29.1.1",
    "postcss": "^8.5.17",
    "tailwindcss": "^4.3.2",
    "tsx": "^4.23.0",
    "typescript": "5.8.2",
    "vitest": "^4.1.10"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create tsconfig.server.json**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "outDir": "dist",
    "noEmit": false
  },
  "include": ["server.mts", "src/server/**/*.ts", "src/game-engine/**/*.ts", "src/cards/**/*.ts"]
}
```

- [ ] **Step 4: Create next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

- [ ] **Step 5: Create postcss.config.js**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 6: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 7: Create .gitignore**

```
node_modules/
.next/
dist/
.superpowers/
```

- [ ] **Step 8: Create server.mts**

```ts
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setupSocket } from "./src/server/socket";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  setupSocket(io);

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
```

- [ ] **Step 9: Install dependencies**

Run: `npm install`

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: project scaffolding with Next.js + Socket.IO + Tailwind"
```

---

### Task 2: Game Engine Types + Cards Data

**Files:**
- Create: `src/game-engine/types.ts`
- Create: `src/cards/data.ts`

- [ ] **Step 1: Create src/game-engine/types.ts**

```ts
export interface Card {
  id: number;
  text: string;
}

export interface Player {
  id: string;
  name: string;
  cardsWon: number;
  connected: boolean;
  isHost: boolean;
}

export interface Vote {
  playerId: string;
  targetId: string | null;
}

export interface Round {
  roundNumber: number;
  card: Card;
  votes: Vote[];
  votesRevealed: boolean;
  winnerId: string | null;
}

export type RoomStatus = "waiting" | "voting" | "revealing" | "finished";

export interface Room {
  code: string;
  host: string;
  players: Player[];
  status: RoomStatus;
  cardsToWin: number;
  deck: Card[];
  currentCardIndex: number;
  rounds: Round[];
  timerSeconds: number;
  winnerId: string | null;
  playAgainVotes: string[];
}

export interface GameResult {
  players: Player[];
  winner: Player;
  isTie: boolean;
}
```

- [ ] **Step 2: Create src/cards/data.ts**

```ts
import { Card } from "@/game-engine/types";

export const cards: Card[] = [
  { id: 1, text: "Um de nos, secretamente, deseja a morte dos outros. Quem?" },
  { id: 2, text: "Acabamos de descobrir um baita segredo! Quem e o primeiro a conta-lo?" },
  { id: 3, text: "Um de nos tem o fetiche de comer coco. Quem?" },
  { id: 4, text: "Um de nos acredita que o mundo seria melhor se nao tivesse saude publica. Quem?" },
  { id: 5, text: "Um de nos, secretamente, admira Hitler. Quem?" },
  { id: 6, text: "Quem odeia a propria vida?" },
  { id: 7, text: "Alugamos uma casa de praia e esta tudo certo pra viagem. Quem fura no ultimo minuto e deixa todos na mao?" },
  { id: 8, text: "Quem pede dinheiro emprestado sabendo que nunca vai devolver?" },
  { id: 9, text: "Se todos fossemos presidentes de um pais, quem seria o primeiro a impor a pena de morte?" },
  { id: 10, text: "Voce esta em uma situacao complicada. Para qual de nos voce NAO pede conselho?" },
  { id: 11, text: "Somos candidatos a presidente. Quem recebe menos votos?" },
  { id: 12, text: "Um de nos tem uma vida dupla. Quem?" },
  { id: 13, text: "Estamos todos em quarentena, contagiados por um virus mortal e incuravel. Quem ira escapar e gerar uma epidemia?" },
  { id: 14, text: "Todos temos medo quando o motorista da vez e..." },
  { id: 15, text: "Voce finge que esta dormindo para nao ter que conversar com a pessoa do seu lado. Quem e essa pessoa?" },
  { id: 16, text: "Estamos em um aviao sem controle e achamos paraquedas pra todos, menos pra um. Quem e o primeiro a pegar um paraquedas e se salvar?" },
  { id: 17, text: "Viajamos todos para Las Vegas. Quem volta casado?" },
  { id: 18, text: "Nos eramos apostolos. Quem era Judas?" },
  { id: 19, text: "Cada um publica um livro com sua propria autobiografia. Qual te interessa menos?" },
  { id: 20, text: "Um de nos nunca mais podera te abracar. Quem?" },
  { id: 21, text: "Somos parte de um grupo de foragidos procurados no Velho Oeste. A cabeca de quem vale menos?" },
  { id: 22, text: "Precisamos de alguem para comandar as nossas tropas. Por favor, que nao seja..." },
  { id: 23, text: "Se todos decidirmos virar comediantes, quem e o primeiro a morrer de fome?" },
  { id: 24, text: "Em futuro proximo, um de nos ira morrer sendo vitima de um acerto de contas. Quem?" },
  { id: 25, text: "Quem se acha mais inteligente do que realmente e?" },
  { id: 26, text: "Acordamos em uma ilha deserta e sem nenhum alimento. Quem ira propor canibalismo?" },
  { id: 27, text: "Qual de nos voce jamais se atreveria a deixar irritado?" },
  { id: 28, text: "Estamos na prisao. Quem e o primeiro a se prostituir em troca de protecao?" },
  { id: 29, text: "Fomos convidados ao programa do Silvio. Quem discute com ele?" },
  { id: 30, text: "Quem se acha melhor do que os outros?" },
  { id: 31, text: "Vossa Majestade Infernal, tambem conhecido como Satanas, propoe realizar todos os nossos desejos em troca de nossas almas. Quem e o primeiro a aceitar?" },
  { id: 32, text: "Ganharemos mil dolares pra cada colher de merda que comermos. Quem esta mais disposto a ser rico?" },
  { id: 33, text: "Quem pede o prato mais caro do cardapio e se faz de sonso na hora de dividir a conta?" },
  { id: 34, text: "Jamais encostaria na roupa intima de..." },
  { id: 35, text: "O servico militar agora e obrigatorio para todos e todas. Quem e o primeiro a atirar no proprio pe para nao servir?" },
  { id: 36, text: "Quem le a Biblia?" },
  { id: 37, text: "Todo grupo de amigos tem aquele que se veste muito mal. Em nosso grupo e..." },
  { id: 38, text: "Estamos no Apocalipse Zumbi! Quem e o primeiro a morrer?" },
  { id: 39, text: "Trabalhamos em um restaurante de fast food. Quem cospe na comida?" },
  { id: 40, text: "Um de nos e, na realidade, um robo. Quem?" },
  { id: 41, text: "Qual de nos voce NAO escolheria para adotar o seu filho?" },
  { id: 42, text: "\"Acho certo que o Brasil permita o casamento entre duas pessoas do mesmo genero\" todos pensam, menos..." },
  { id: 43, text: "Quem peidou?" },
  { id: 44, text: "Quem convidaria um ex para tomar um cafe e mentiria descaradamente sobre sua vida atual?" },
  { id: 45, text: "Estamos participando de um reality show de talentos. Quem e eliminado no primeiro capitulo?" },
  { id: 46, text: "Um de nos tem uma colecao de chicletes mastigados pelo ex. Quem?" },
  { id: 47, text: "Um de nos nao ve graca nesse jogo, mas esta rindo apenas pra fingir que nao e um cuzao. Quem?" },
  { id: 48, text: "Um de nos finge que esta de boa, mas esta secretamente ressentido pelo resultado de uma carta. Quem?" },
  { id: 49, text: "Descobriram a formula da imortalidade. Para o bem da humanidade, voce esconde a formula de quem?" },
  { id: 50, text: "Um amigo em comum necessita de doacao de sangue. Quem disse que doou, mas nem apareceu?" },
  { id: 51, text: "Um de nos gosta de sentir o proprio cheiro de chule. Quem?" },
  { id: 52, text: "Estamos em um apocalipse nuclear. Quem roubaria os suprimentos de comida escondido?" },
  { id: 53, text: "Quem e o mais provavel de esquecer o aniversario de todos?" },
  { id: 54, text: "Um de nos tem vergonha dos proprios pais. Quem?" },
  { id: 55, text: "Quem seria o primeiro a vender um amigo por dinheiro?" },
  { id: 56, text: "Quem ja stalkeou o ex nas redes sociais usando conta fake?" },
  { id: 57, text: "Um de nos tem medo irracional de pombo. Quem?" },
  { id: 58, text: "Quem e o mais provavel de dar bolo e inventar desculpa esfarrapada?" },
  { id: 59, text: "Quem trocaria um amigo por um influenciador famoso?" },
  { id: 60, text: "Um de nos ainda manda mensagem para \"crush\" que nao responde. Quem?" },
  { id: 61, text: "Quem faria pacto com entidade sobrenatural em troca de fama?" },
  { id: 62, text: "Um de nos tem playlist secreta so com musica brega. Quem?" },
  { id: 63, text: "Quem ja fingiu nao ver alguem na rua para nao ter que cumprimentar?" },
  { id: 64, text: "Um de nos ja chorou vendo comercial de TV. Quem?" },
  { id: 65, text: "Quem seria o primeiro a rir num velorio em momento inadequado?" },
  { id: 66, text: "Um de nos tem colecao bizarra escondida em casa. Quem?" },
  { id: 67, text: "Quem e mais provavel de virar coach picareta?" },
  { id: 68, text: "Um de nos ja fucou o celular de outra pessoa escondido. Quem?" },
  { id: 69, text: "Quem terminaria relacionamento por mensagem de texto?" },
  { id: 70, text: "Um de nos ainda sente ciume de relacionamento antigo. Quem?" },
  { id: 71, text: "Quem toparia participar de experimento cientifico perigoso em troca de dinheiro?" },
  { id: 72, text: "Um de nos mente sobre quantas pessoas ja beijou. Quem?" },
  { id: 73, text: "Quem inventaria fake news so para ver a confusao?" },
  { id: 74, text: "Um de nos marcaria casamento so para ganhar presente. Quem?" },
  { id: 75, text: "Quem seria o primeiro a abandonar o grupo no meio de um perrengue?" },
  { id: 76, text: "Um de nos ja desejou o termino do relacionamento de outra pessoa. Quem?" },
  { id: 77, text: "Quem toparia viver em reality show 24 horas por dia?" },
  { id: 78, text: "Um de nos guarda rancor por coisa pequena ha anos. Quem?" },
  { id: 79, text: "Quem seria cancelado na internet em menos de uma semana?" },
  { id: 80, text: "Um de nos tem fantasias estranhas com professor(a) do passado. Quem?" },
  { id: 81, text: "Quem trocaria voto por favor pessoal?" },
  { id: 82, text: "Um de nos ainda conversa com \"contatinho\" enquanto esta em relacionamento serio. Quem?" },
  { id: 83, text: "Quem e mais provavel de inventar doenca para faltar a compromisso?" },
  { id: 84, text: "Um de nos desligaria o Wi-Fi da casa inteira para ter paz. Quem?" },
];
```

- [ ] **Step 3: Verify cards count**

Run: `tsx -e "const {cards} = require('./src/cards/data.ts'); console.log(cards.length)"`
Expected output: `84`

- [ ] **Step 4: Commit**

```bash
git add src/game-engine/types.ts src/cards/data.ts
git commit -m "feat: add game types and 84 cards data"
```

---

### Task 3: Game Engine — Deck

**Files:**
- Create: `src/game-engine/deck.ts`
- Create: `src/tests/game-engine/deck.test.ts`
- Create: `src/tests/setup.ts`

- [ ] **Step 1: Create test setup src/tests/setup.ts**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 2: Write failing test src/tests/game-engine/deck.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { shuffleDeck, drawCard } from "@/game-engine/deck";
import { cards } from "@/cards/data";

describe("shuffleDeck", () => {
  it("returns an array with all 84 cards", () => {
    const deck = shuffleDeck();
    expect(deck).toHaveLength(84);
  });

  it("contains all card ids", () => {
    const deck = shuffleDeck();
    const ids = deck.map((c) => c.id).sort((a, b) => a - b);
    expect(ids).toEqual(cards.map((c) => c.id).sort((a, b) => a - b));
  });

  it("does not mutate the original cards array", () => {
    const snapshot = [...cards];
    shuffleDeck();
    expect(cards).toEqual(snapshot);
  });
});

describe("drawCard", () => {
  it("returns the card at the given index", () => {
    const deck = cards;
    const card = drawCard(deck, 0);
    expect(card).toBeDefined();
    expect(card!.id).toBe(deck[0].id);
  });

  it("returns undefined for out-of-bounds index", () => {
    expect(drawCard(cards, 999)).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/tests/game-engine/deck.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 4: Create src/game-engine/deck.ts**

```ts
import { Card } from "./types";
import { cards } from "@/cards/data";

export function shuffleDeck(): Card[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCard(deck: Card[], index: number): Card | undefined {
  return deck[index];
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/tests/game-engine/deck.test.ts`
Expected: 4 tests pass

- [ ] **Step 6: Commit**

```bash
git add src/game-engine/deck.ts src/tests/game-engine/deck.test.ts src/tests/setup.ts
git commit -m "feat: deck module with shuffle and draw"
```

---

### Task 4: Game Engine — Room

**Files:**
- Create: `src/game-engine/room.ts`
- Create: `src/tests/game-engine/room.test.ts`

- [ ] **Step 1: Write failing test src/tests/game-engine/room.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { createRoom, joinRoom, removePlayer, setPlayerDisconnected } from "@/game-engine/room";
import { Room } from "@/game-engine/types";

function makeWaitingRoom(): Room {
  return createRoom("Alice");
}

describe("createRoom", () => {
  it("creates a room with a 6-char code", () => {
    const room = createRoom("Alice");
    expect(room.code).toHaveLength(6);
    expect(room.code).toMatch(/^[A-Z0-9]+$/);
  });

  it("sets the creator as host and first player", () => {
    const room = createRoom("Alice");
    expect(room.players).toHaveLength(1);
    expect(room.players[0].name).toBe("Alice");
    expect(room.players[0].isHost).toBe(true);
    expect(room.players[0].connected).toBe(true);
    expect(room.host).toBe(room.players[0].id);
  });

  it("initializes with status waiting and shuffled deck", () => {
    const room = createRoom("Alice");
    expect(room.status).toBe("waiting");
    expect(room.deck).toHaveLength(84);
    expect(room.cardsToWin).toBe(5);
    expect(room.currentCardIndex).toBe(0);
    expect(room.rounds).toEqual([]);
    expect(room.timerSeconds).toBe(5);
  });
});

describe("joinRoom", () => {
  it("adds a player to the room", () => {
    const room = makeWaitingRoom();
    const updated = joinRoom(room, "Bob");
    expect(updated.players).toHaveLength(2);
    expect(updated.players[1].name).toBe("Bob");
    expect(updated.players[1].isHost).toBe(false);
  });

  it("throws if room status is not waiting", () => {
    const room = { ...makeWaitingRoom(), status: "playing" as const };
    expect(() => joinRoom(room, "Bob")).toThrow("Nao e possivel entrar em uma partida em andamento");
  });
});

describe("removePlayer", () => {
  it("removes a player and transfers host if needed", () => {
    const room = makeWaitingRoom();
    const withBob = joinRoom(room, "Bob");
    const hostId = withBob.host;
    const updated = removePlayer(withBob, hostId);
    expect(updated.players).toHaveLength(1);
    expect(updated.host).toBe(updated.players[0].id);
  });

  it("removes last player resulting in empty room", () => {
    const room = makeWaitingRoom();
    const hostId = room.players[0].id;
    const updated = removePlayer(room, hostId);
    expect(updated.players).toHaveLength(0);
  });
});

describe("setPlayerDisconnected", () => {
  it("marks a player as disconnected", () => {
    const room = makeWaitingRoom();
    const updated = setPlayerDisconnected(room, room.players[0].id);
    expect(updated.players[0].connected).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/game-engine/room.test.ts`
Expected: FAIL

- [ ] **Step 3: Create src/game-engine/room.ts**

```ts
import { Room, Player } from "./types";
import { shuffleDeck } from "./deck";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createRoom(playerName: string): Room {
  const playerId = generateId();
  const hostPlayer: Player = {
    id: playerId,
    name: playerName,
    cardsWon: 0,
    connected: true,
    isHost: true,
  };
  return {
    code: generateRoomCode(),
    host: playerId,
    players: [hostPlayer],
    status: "waiting",
    cardsToWin: 5,
    deck: shuffleDeck(),
    currentCardIndex: 0,
    rounds: [],
    timerSeconds: 5,
    winnerId: null,
    playAgainVotes: [],
  };
}

export function joinRoom(room: Room, playerName: string): Room {
  if (room.status !== "waiting") {
    throw new Error("Nao e possivel entrar em uma partida em andamento");
  }
  const newPlayer: Player = {
    id: generateId(),
    name: playerName,
    cardsWon: 0,
    connected: true,
    isHost: false,
  };
  return { ...room, players: [...room.players, newPlayer] };
}

export function removePlayer(room: Room, playerId: string): Room {
  const updatedPlayers = room.players.filter((p) => p.id !== playerId);
  let updatedHost = room.host;
  if (room.host === playerId && updatedPlayers.length > 0) {
    updatedHost = updatedPlayers[0].id;
    updatedPlayers[0] = { ...updatedPlayers[0], isHost: true };
  }
  return { ...room, players: updatedPlayers, host: updatedHost };
}

export function setPlayerDisconnected(room: Room, playerId: string): Room {
  return {
    ...room,
    players: room.players.map((p) =>
      p.id === playerId ? { ...p, connected: false } : p,
    ),
  };
}

export function findPlayer(room: Room, playerId: string): Player | undefined {
  return room.players.find((p) => p.id === playerId);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/game-engine/room.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/game-engine/room.ts src/tests/game-engine/room.test.ts
git commit -m "feat: room module with create, join, remove, disconnect"
```

---

### Task 5: Game Engine — Round (Voting)

**Files:**
- Create: `src/game-engine/round.ts`
- Create: `src/tests/game-engine/round.test.ts`

- [ ] **Step 1: Write failing test src/tests/game-engine/round.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { startRound, recordVote, revealVotes, resolveRound } from "@/game-engine/round";
import { createRoom, joinRoom } from "@/game-engine/room";
import { Room, Player } from "@/game-engine/types";

function makeRoom(players: string[]): Room {
  let room = createRoom(players[0]);
  for (let i = 1; i < players.length; i++) {
    room = joinRoom(room, players[i]);
  }
  return { ...room, status: "playing" };
}

describe("startRound", () => {
  it("draws the next card and sets room status to voting", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const updated = startRound(room);
    expect(updated.status).toBe("voting");
    expect(updated.rounds).toHaveLength(1);
    expect(updated.rounds[0].card).toBeDefined();
    expect(updated.rounds[0].card.text).toBe(updated.deck[0].text);
    expect(updated.rounds[0].votes).toEqual([]);
    expect(updated.rounds[0].votesRevealed).toBe(false);
  });

  it("increments round number for subsequent rounds", () => {
    const room = makeRoom(["Alice", "Bob"]);
    const rd1 = startRound(room);
    const rd2 = startRound(rd1);
    expect(rd2.rounds).toHaveLength(2);
    expect(rd2.rounds[0].roundNumber).toBe(1);
    expect(rd2.rounds[1].roundNumber).toBe(2);
  });
});

describe("recordVote", () => {
  it("records a vote for a target player", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const voting = startRound(room);
    const voterId = voting.players[0].id;
    const targetId = voting.players[1].id;
    const updated = recordVote(voting, voterId, targetId);
    expect(updated.rounds[0].votes).toHaveLength(1);
    expect(updated.rounds[0].votes[0].playerId).toBe(voterId);
    expect(updated.rounds[0].votes[0].targetId).toBe(targetId);
  });

  it("throws if player votes for themselves", () => {
    const room = makeRoom(["Alice", "Bob"]);
    const voting = startRound(room);
    const voterId = voting.players[0].id;
    expect(() => recordVote(voting, voterId, voterId)).toThrow("Voce nao pode votar em si mesmo");
  });

  it("throws if player already voted", () => {
    const room = makeRoom(["Alice", "Bob"]);
    const voting = startRound(room);
    const voterId = voting.players[0].id;
    const targetId = voting.players[1].id;
    const withVote = recordVote(voting, voterId, targetId);
    expect(() => recordVote(withVote, voterId, targetId)).toThrow("Voce ja votou nesta rodada");
  });
});

describe("revealVotes", () => {
  it("sets votesRevealed to true", () => {
    const room = makeRoom(["Alice", "Bob"]);
    const voting = startRound(room);
    const updated = revealVotes(voting);
    expect(updated.rounds[0].votesRevealed).toBe(true);
    expect(updated.status).toBe("revealing");
  });
});

describe("resolveRound", () => {
  it("returns winnerId for the most voted player", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    let voting = startRound(room);
    const [a, b, c] = voting.players;
    voting = recordVote(voting, a.id, b.id);
    voting = recordVote(voting, b.id, b.id); // Bob voted himself? no — let me fix: b votes for b? No can't self-vote
    // Actually: a→b, b→c, c→b → b has 2 votes, wins
    // Let me rewrite test properly
  });

  it("returns winnerId for most voted player", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    let voting = startRound(room);
    const [a, b, c] = voting.players;
    voting = recordVote(voting, a.id, b.id);
    voting = recordVote(voting, b.id, b.id); // this will throw — can't self vote
  });
});
```

Wait, let me fix the tests properly since self-vote is banned:

```ts
import { describe, it, expect } from "vitest";
import { startRound, recordVote, revealVotes, resolveRound } from "@/game-engine/round";
import { createRoom, joinRoom } from "@/game-engine/room";
import { Room } from "@/game-engine/types";

function makeRoom(players: string[]): Room {
  let room = createRoom(players[0]);
  for (let i = 1; i < players.length; i++) {
    room = joinRoom(room, players[i]);
  }
  return { ...room, status: "playing" };
}

describe("startRound", () => {
  it("draws the next card and sets room status to voting", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const updated = startRound(room);
    expect(updated.status).toBe("voting");
    expect(updated.rounds).toHaveLength(1);
    expect(updated.rounds[0].card).toBeDefined();
    expect(updated.rounds[0].votes).toEqual([]);
    expect(updated.rounds[0].votesRevealed).toBe(false);
  });
});

describe("recordVote", () => {
  it("records a vote for a target player", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const voting = startRound(room);
    const voterId = voting.players[0].id;
    const targetId = voting.players[1].id;
    const updated = recordVote(voting, voterId, targetId);
    expect(updated.rounds[0].votes).toHaveLength(1);
    expect(updated.rounds[0].votes[0].playerId).toBe(voterId);
    expect(updated.rounds[0].votes[0].targetId).toBe(targetId);
  });

  it("throws if player votes for themselves", () => {
    const room = makeRoom(["Alice", "Bob"]);
    const voting = startRound(room);
    const voterId = voting.players[0].id;
    expect(() => recordVote(voting, voterId, voterId)).toThrow("Voce nao pode votar em si mesmo");
  });

  it("throws if player already voted", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const voting = startRound(room);
    const [a, b, c] = voting.players;
    const withVote = recordVote(voting, a.id, b.id);
    expect(() => recordVote(withVote, a.id, c.id)).toThrow("Voce ja votou nesta rodada");
  });
});

describe("revealVotes", () => {
  it("sets votesRevealed and status to revealing", () => {
    const room = makeRoom(["Alice", "Bob"]);
    const voting = startRound(room);
    const updated = revealVotes(voting);
    expect(updated.rounds[0].votesRevealed).toBe(true);
    expect(updated.status).toBe("revealing");
  });
});

describe("resolveRound", () => {
  it("returns winnerId for most voted player", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    let voting = startRound(room);
    const [a, b, c] = voting.players;
    voting = recordVote(voting, a.id, b.id);
    voting = recordVote(voting, b.id, a.id);
    voting = recordVote(voting, c.id, b.id); // b has 2 votes
    const result = resolveRound(voting);
    expect(result.winnerId).toBe(b.id);
    expect(result.winner.cardsWon).toBe(1);
  });

  it("returns null winnerId on tie", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    let voting = startRound(room);
    const [a, b, c] = voting.players;
    voting = recordVote(voting, a.id, b.id);
    voting = recordVote(voting, b.id, c.id);
    voting = recordVote(voting, c.id, a.id); // 1 vote each
    const result = resolveRound(voting);
    expect(result.winnerId).toBeNull();
    expect(result.winner.cardsWon).toBe(0);
  });
});
```

Fix the test file content:

- [ ] **Step 1 (corrected): Write test src/tests/game-engine/round.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { startRound, recordVote, resolveRound } from "@/game-engine/round";
import { createRoom, joinRoom } from "@/game-engine/room";
import { Room } from "@/game-engine/types";

function makeRoom(players: string[]): Room {
  let room = createRoom(players[0]);
  for (let i = 1; i < players.length; i++) {
    room = joinRoom(room, players[i]);
  }
  return { ...room, status: "playing" };
}

describe("startRound", () => {
  it("draws the next card and sets room status to voting", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const updated = startRound(room);
    expect(updated.status).toBe("voting");
    expect(updated.rounds).toHaveLength(1);
    expect(updated.rounds[0].card).toBeDefined();
    expect(updated.rounds[0].votes).toEqual([]);
    expect(updated.rounds[0].votesRevealed).toBe(false);
    expect(updated.rounds[0].winnerId).toBeNull();
  });
});

describe("recordVote", () => {
  it("records a vote for a target player", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const voting = startRound(room);
    const voterId = voting.players[0].id;
    const targetId = voting.players[1].id;
    const updated = recordVote(voting, voterId, targetId);
    expect(updated.rounds[0].votes).toHaveLength(1);
    expect(updated.rounds[0].votes[0].playerId).toBe(voterId);
    expect(updated.rounds[0].votes[0].targetId).toBe(targetId);
  });

  it("throws if player votes for themselves", () => {
    const room = makeRoom(["Alice", "Bob"]);
    const voting = startRound(room);
    const voterId = voting.players[0].id;
    expect(() => recordVote(voting, voterId, voterId)).toThrow("Voce nao pode votar em si mesmo");
  });

  it("throws if player already voted", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const voting = startRound(room);
    const [a, b, c] = voting.players;
    const withVote = recordVote(voting, a.id, b.id);
    expect(() => recordVote(withVote, a.id, c.id)).toThrow("Voce ja votou nesta rodada");
  });
});

describe("resolveRound", () => {
  it("returns winnerId for most voted player", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    let voting = startRound(room);
    const [a, b, c] = voting.players;
    voting = recordVote(voting, a.id, b.id);
    voting = recordVote(voting, b.id, a.id);
    voting = recordVote(voting, c.id, b.id);
    const result = resolveRound(voting);
    expect(result.winnerId).toBe(b.id);
  });

  it("returns null winnerId on tie", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    let voting = startRound(room);
    const [a, b, c] = voting.players;
    voting = recordVote(voting, a.id, b.id);
    voting = recordVote(voting, b.id, c.id);
    voting = recordVote(voting, c.id, a.id);
    const result = resolveRound(voting);
    expect(result.winnerId).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/game-engine/round.test.ts`
Expected: FAIL

- [ ] **Step 3: Create src/game-engine/round.ts**

```ts
import { Room, Round, Vote, Card } from "./types";

export function startRound(room: Room): Room {
  const card = room.deck[room.currentCardIndex];
  const round: Round = {
    roundNumber: room.rounds.length + 1,
    card,
    votes: [],
    votesRevealed: false,
    winnerId: null,
  };
  return {
    ...room,
    status: "voting",
    rounds: [...room.rounds, round],
  };
}

export function recordVote(room: Room, playerId: string, targetId: string): Room {
  if (playerId === targetId) {
    throw new Error("Voce nao pode votar em si mesmo");
  }
  const currentRound = room.rounds[room.rounds.length - 1];
  if (!currentRound) {
    throw new Error("Nenhuma rodada ativa");
  }
  const alreadyVoted = currentRound.votes.find((v) => v.playerId === playerId);
  if (alreadyVoted) {
    throw new Error("Voce ja votou nesta rodada");
  }
  const vote: Vote = { playerId, targetId };
  return {
    ...room,
    rounds: [
      ...room.rounds.slice(0, -1),
      { ...currentRound, votes: [...currentRound.votes, vote] },
    ],
  };
}

export function allVotesIn(room: Room): boolean {
  const currentRound = room.rounds[room.rounds.length - 1];
  if (!currentRound) return false;
  return currentRound.votes.length >= room.players.length;
}

export function resolveRound(room: Room): Room {
  const currentRound = room.rounds[room.rounds.length - 1];
  if (!currentRound) return room;

  const voteCounts = new Map<string, number>();
  for (const vote of currentRound.votes) {
    if (vote.targetId) {
      voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
    }
  }

  let maxVotes = 0;
  let winnerId: string | null = null;
  let isTie = false;

  for (const [playerId, count] of voteCounts) {
    if (count > maxVotes) {
      maxVotes = count;
      winnerId = playerId;
      isTie = false;
    } else if (count === maxVotes) {
      isTie = true;
    }
  }

  if (isTie) {
    winnerId = null;
  }

  const updatedPlayers = winnerId
    ? room.players.map((p) =>
        p.id === winnerId ? { ...p, cardsWon: p.cardsWon + 1 } : p,
      )
    : room.players;

  return {
    ...room,
    players: updatedPlayers,
    currentCardIndex: room.currentCardIndex + 1,
    status: "revealing",
    rounds: [
      ...room.rounds.slice(0, -1),
      { ...currentRound, votesRevealed: true, winnerId },
    ],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/game-engine/round.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/game-engine/round.ts src/tests/game-engine/round.test.ts
git commit -m "feat: round module with voting, reveal, and resolution"
```

---

### Task 6: Game Engine — Game + Scoring

**Files:**
- Create: `src/game-engine/game.ts`
- Create: `src/game-engine/scoring.ts`
- Create: `src/tests/game-engine/scoring.test.ts`
- Create: `src/tests/game-engine/game.test.ts`

- [ ] **Step 1: Write scoring test src/tests/game-engine/scoring.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { buildGameResult } from "@/game-engine/scoring";
import { Player } from "@/game-engine/types";

function makePlayer(id: string, cardsWon: number): Player {
  return { id, name: id, cardsWon, connected: true, isHost: false };
}

describe("buildGameResult", () => {
  it("returns player with most cards as winner", () => {
    const players = [makePlayer("a", 2), makePlayer("b", 5), makePlayer("c", 1)];
    const result = buildGameResult(players);
    expect(result.winner.id).toBe("b");
    expect(result.isTie).toBe(false);
  });

  it("handles tie between top players", () => {
    const players = [makePlayer("a", 5), makePlayer("b", 5), makePlayer("c", 2)];
    const result = buildGameResult(players);
    expect(result.isTie).toBe(true);
  });

  it("sorts players by cardsWon descending", () => {
    const players = [makePlayer("a", 1), makePlayer("b", 3), makePlayer("c", 2)];
    const result = buildGameResult(players);
    expect(result.players[0].cardsWon).toBe(3);
    expect(result.players[1].cardsWon).toBe(2);
    expect(result.players[2].cardsWon).toBe(1);
  });
});
```

- [ ] **Step 2: Create src/game-engine/scoring.ts**

```ts
import { Player, GameResult } from "./types";

export function buildGameResult(players: Player[]): GameResult {
  const sorted = [...players].sort((a, b) => b.cardsWon - a.cardsWon);
  const maxCards = sorted[0]?.cardsWon ?? 0;
  const topPlayers = sorted.filter((p) => p.cardsWon === maxCards);
  return {
    players: sorted,
    winner: sorted[0],
    isTie: topPlayers.length > 1,
  };
}
```

- [ ] **Step 3: Run scoring test to verify**

Run: `npx vitest run src/tests/game-engine/scoring.test.ts`
Expected: All pass

- [ ] **Step 4: Write game test src/tests/game-engine/game.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { startGame, isGameOver, checkWinCondition } from "@/game-engine/game";
import { createRoom, joinRoom } from "@/game-engine/room";

function makeRoom(players: string[]): ReturnType<typeof createRoom> {
  let room = createRoom(players[0]);
  for (let i = 1; i < players.length; i++) {
    room = joinRoom(room, players[i]);
  }
  return room;
}

describe("startGame", () => {
  it("transitions room to playing status and starts first round", () => {
    let room = makeRoom(["Alice", "Bob", "Charlie"]);
    room = { ...room, cardsToWin: 5 };
    const playing = startGame(room);
    expect(playing.status).toBe("voting");
    expect(playing.rounds).toHaveLength(1);
  });

  it("throws if fewer than 3 players", () => {
    const room = makeRoom(["Alice", "Bob"]);
    expect(() => startGame(room)).toThrow("Minimo de 3 jogadores");
  });
});

describe("checkWinCondition", () => {
  it("returns true when a player has cardsToWin cards", () => {
    let room = makeRoom(["Alice", "Bob", "Charlie"]);
    room = { ...room, cardsToWin: 5, status: "playing" };
    room = {
      ...room,
      players: room.players.map((p) =>
        p.id === room.players[0].id ? { ...p, cardsWon: 5 } : p,
      ),
    };
    expect(checkWinCondition(room)).toBe(true);
  });

  it("returns false when no one has enough cards", () => {
    let room = makeRoom(["Alice", "Bob", "Charlie"]);
    room = { ...room, cardsToWin: 5, status: "playing" };
    room = {
      ...room,
      players: room.players.map((p) =>
        p.id === room.players[0].id ? { ...p, cardsWon: 4 } : p,
      ),
    };
    expect(checkWinCondition(room)).toBe(false);
  });
});
```

- [ ] **Step 5: Create src/game-engine/game.ts**

```ts
import { Room } from "./types";
import { startRound } from "./round";

export function startGame(room: Room): Room {
  if (room.players.length < 3) {
    throw new Error("Minimo de 3 jogadores");
  }
  return startRound({ ...room, status: "playing" });
}

export function checkWinCondition(room: Room): boolean {
  return room.players.some((p) => p.cardsWon >= room.cardsToWin);
}

export function isGameOver(room: Room): boolean {
  return room.status === "finished";
}
```

- [ ] **Step 6: Run game test to verify**

Run: `npx vitest run src/tests/game-engine/game.test.ts`
Expected: All pass

- [ ] **Step 7: Commit**

```bash
git add src/game-engine/game.ts src/game-engine/scoring.ts src/tests/game-engine/game.test.ts src/tests/game-engine/scoring.test.ts
git commit -m "feat: game orchestration and scoring modules"
```

---

### Task 7: Server — Room Storage + Socket Handlers

**Files:**
- Create: `src/server/rooms.ts`
- Create: `src/server/socket.ts`

- [ ] **Step 1: Create src/server/rooms.ts**

```ts
import { Room } from "@/game-engine/types";

const rooms = new Map<string, Room>();

export function getRoom(roomCode: string): Room | undefined {
  return rooms.get(roomCode);
}

export function setRoom(roomCode: string, room: Room): void {
  rooms.set(roomCode, room);
}

export function deleteRoom(roomCode: string): void {
  rooms.delete(roomCode);
}

const socketToPlayer = new Map<string, { roomCode: string; playerId: string }>();
const playerToSocket = new Map<string, string>();

export function mapSocketToPlayer(socketId: string, roomCode: string, playerId: string): void {
  socketToPlayer.set(socketId, { roomCode, playerId });
  playerToSocket.set(playerId, socketId);
}

export function removeSocketMapping(socketId: string): { roomCode: string; playerId: string } | undefined {
  const mapping = socketToPlayer.get(socketId);
  if (mapping) {
    socketToPlayer.delete(socketId);
    playerToSocket.delete(mapping.playerId);
  }
  return mapping;
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  const mapping = socketToPlayer.get(socketId);
  if (!mapping) return undefined;
  return rooms.get(mapping.roomCode);
}

export function getPlayerIdBySocketId(socketId: string): string | undefined {
  return socketToPlayer.get(socketId)?.playerId;
}
```

- [ ] **Step 2: Create src/server/socket.ts**

```ts
import { Server as SocketIOServer, Socket } from "socket.io";
import { createRoom, joinRoom, removePlayer, setPlayerDisconnected } from "@/game-engine/room";
import { startGame, checkWinCondition } from "@/game-engine/game";
import { recordVote, resolveRound, startRound, allVotesIn } from "@/game-engine/round";
import { buildGameResult } from "@/game-engine/scoring";
import {
  getRoom, setRoom, deleteRoom,
  mapSocketToPlayer, removeSocketMapping,
  getRoomBySocketId, getPlayerIdBySocketId,
} from "./rooms";
import { Room } from "@/game-engine/types";

const VOTE_TIMEOUT = 5000;
const REVEAL_TIMEOUT = 3000;
const DISCONNECT_TIMEOUT = 60000;

export function setupSocket(io: SocketIOServer): void {
  io.on("connection", (socket: Socket) => {

    socket.on("room:create", ({ playerName }: { playerName: string }) => {
      if (!playerName?.trim()) {
        socket.emit("error", { message: "Nome nao pode ser vazio" });
        return;
      }
      const room = createRoom(playerName.trim());
      setRoom(room.code, room);
      const player = room.players[0];
      mapSocketToPlayer(socket.id, room.code, player.id);
      socket.join(room.code);
      socket.emit("player:id", player.id);
      socket.emit("room:state", room);
    });

    socket.on("room:join", ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
      const room = getRoom(roomCode);
      if (!room) {
        socket.emit("error", { message: "Sala nao encontrada" });
        return;
      }
      if (!playerName?.trim()) {
        socket.emit("error", { message: "Nome nao pode ser vazio" });
        return;
      }
      try {
        const updated = joinRoom(room, playerName.trim());
        setRoom(roomCode, updated);
        const player = updated.players[updated.players.length - 1];
        mapSocketToPlayer(socket.id, roomCode, player.id);
        socket.join(roomCode);
        socket.emit("player:id", player.id);
        io.to(roomCode).emit("room:state", updated);
      } catch (e: any) {
        socket.emit("error", { message: e.message });
      }
    });

    socket.on("game:start", ({ cardsToWin }: { cardsToWin: number }) => {
      const room = getRoomBySocketId(socket.id);
      if (!room) return;
      const playerId = getPlayerIdBySocketId(socket.id);
      if (room.host !== playerId) {
        socket.emit("error", { message: "Apenas o host pode iniciar" });
        return;
      }
      if (![4, 5, 7].includes(cardsToWin)) {
        socket.emit("error", { message: "Numero de cartas invalido. Use 4, 5 ou 7." });
        return;
      }
      try {
        const withCardsWin = { ...room, cardsToWin };
        const playing = startGame(withCardsWin);
        setRoom(room.code, playing);
        io.to(room.code).emit("room:state", playing);
        startVoteTimer(room.code, playing, io);
      } catch (e: any) {
        socket.emit("error", { message: e.message });
      }
    });

    socket.on("game:vote", ({ targetId }: { targetId: string }) => {
      const room = getRoomBySocketId(socket.id);
      if (!room || room.status !== "voting") return;
      const playerId = getPlayerIdBySocketId(socket.id);
      if (!playerId) return;
      try {
        const updated = recordVote(room, playerId, targetId);
        setRoom(room.code, updated);
        if (allVotesIn(updated)) {
          clearVoteTimer(room.code);
          finishVoting(room.code, updated, io);
        }
      } catch (e: any) {
        socket.emit("error", { message: e.message });
      }
    });

    socket.on("game:playAgain", () => {
      const room = getRoomBySocketId(socket.id);
      if (!room) return;
      const playerId = getPlayerIdBySocketId(socket.id);
      if (!playerId) return;
      const votes = [...new Set([...room.playAgainVotes, playerId])];
      const connectedPlayers = room.players.filter((p) => p.connected).length;
      const updated = { ...room, playAgainVotes: votes };
      setRoom(room.code, updated);
      io.to(room.code).emit("room:state", updated);

      if (votes.length >= connectedPlayers && connectedPlayers >= 3) {
        const resetRoom: Room = {
          ...room,
          status: "playing",
          cardsToWin: room.cardsToWin,
          currentCardIndex: 0,
          rounds: [],
          winnerId: null,
          playAgainVotes: [],
          deck: room.deck,
          players: room.players.map((p) => ({
            ...p,
            cardsWon: 0,
          })),
        };
        const restarted = startRound(resetRoom);
        setRoom(room.code, restarted);
        io.to(room.code).emit("room:state", restarted);
        startVoteTimer(room.code, restarted, io);
      }
    });

    socket.on("disconnect", () => {
      const mapping = removeSocketMapping(socket.id);
      if (!mapping) return;
      const room = getRoom(mapping.roomCode);
      if (!room) return;
      const updated = setPlayerDisconnected(room, mapping.playerId);
      setRoom(mapping.roomCode, updated);
      io.to(mapping.roomCode).emit("room:state", updated);
      setTimeout(() => {
        const r = getRoom(mapping.roomCode);
        if (r) {
          const p = r.players.find((x) => x.id === mapping.playerId);
          if (p && !p.connected) {
            const cleaned = removePlayer(r, mapping.playerId);
            if (cleaned.players.length === 0) {
              deleteRoom(mapping.roomCode);
            } else {
              setRoom(mapping.roomCode, cleaned);
              io.to(mapping.roomCode).emit("room:state", cleaned);
            }
          }
        }
      }, DISCONNECT_TIMEOUT);
    });
  });
}

const voteTimers = new Map<string, ReturnType<typeof setTimeout>>();

function startVoteTimer(roomCode: string, room: Room, io: SocketIOServer): void {
  clearVoteTimer(roomCode);
  voteTimers.set(roomCode, setTimeout(() => {
    const current = getRoom(roomCode);
    if (current && current.status === "voting") {
      finishVoting(roomCode, current, io);
    }
  }, VOTE_TIMEOUT));
}

function clearVoteTimer(roomCode: string): void {
  const timer = voteTimers.get(roomCode);
  if (timer) {
    clearTimeout(timer);
    voteTimers.delete(roomCode);
  }
}

function finishVoting(roomCode: string, room: Room, io: SocketIOServer): void {
  const resolved = resolveRound(room);
  setRoom(roomCode, resolved);
  io.to(roomCode).emit("room:state", resolved);

  setTimeout(() => {
    const r = getRoom(roomCode);
    if (!r) return;
    if (checkWinCondition(r)) {
      const winnerId = buildGameResult(r.players).winner.id;
      const finished = { ...r, status: "finished" as const, winnerId };
      setRoom(roomCode, finished);
      io.to(roomCode).emit("room:state", finished);
      io.to(roomCode).emit("game:end", buildGameResult(r.players));
    } else {
      const nextRound = startRound({ ...r, status: "playing" });
      setRoom(roomCode, nextRound);
      io.to(roomCode).emit("room:state", nextRound);
      startVoteTimer(roomCode, nextRound, io);
    }
  }, REVEAL_TIMEOUT);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/server/rooms.ts src/server/socket.ts
git commit -m "feat: server-side room storage and socket handlers"
```

---

### Task 8: Client Lib — Socket + Store

**Files:**
- Create: `src/lib/socket.ts`
- Create: `src/lib/store.ts`

- [ ] **Step 1: Create src/lib/socket.ts**

```ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || "", { autoConnect: false });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) socket.disconnect();
}
```

- [ ] **Step 2: Create src/lib/store.ts**

```ts
import { create } from "zustand";
import { Room, GameResult } from "@/game-engine/types";
import { getSocket } from "./socket";

interface GameStore {
  room: Room | null;
  myPlayerId: string | null;
  gameResult: GameResult | null;
  error: string | null;

  setRoom: (room: Room) => void;
  setMyPlayerId: (id: string) => void;
  setGameResult: (result: GameResult) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  room: null,
  myPlayerId: null,
  gameResult: null,
  error: null,

  setRoom: (room) => set({ room, error: null }),
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setGameResult: (result) => set({ gameResult: result }),
  setError: (error) => set({ error }),
  reset: () => set({ room: null, myPlayerId: null, gameResult: null, error: null }),
}));

let listenersSetup = false;

export function setupSocketListeners(): void {
  if (listenersSetup) return;
  listenersSetup = true;
  const socket = getSocket();

  socket.on("room:state", (room: Room) => {
    useGameStore.setState((state) => ({
      room,
      error: null,
      gameResult: room.status === "finished" ? state.gameResult : null,
    }));
  });

  socket.on("player:id", (id: string) => {
    useGameStore.getState().setMyPlayerId(id);
  });

  socket.on("game:end", (result: GameResult) => {
    useGameStore.getState().setGameResult(result);
  });

  let errorTimer: ReturnType<typeof setTimeout>;
  socket.on("error", ({ message }: { message: string }) => {
    useGameStore.getState().setError(message);
    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => useGameStore.getState().setError(null), 5000);
  });

  socket.on("disconnect", () => {
    useGameStore.getState().setError("Conexao perdida. Tentando reconectar...");
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/socket.ts src/lib/store.ts
git commit -m "feat: client-side socket singleton and zustand store"
```

---

### Task 9: App Styles + Root Layout

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Create src/app/globals.css**

```css
@import "tailwindcss";

@theme {
  --color-surface: #050505;
  --color-surface-raised: #0d0d0d;
  --color-surface-overlay: #141414;
  --color-surface-card: #1a1a1a;
  --color-brand: #f59e0b;
  --color-brand-light: #fbbf24;
  --color-brand-dark: #d97706;
  --color-brand-glow: rgba(245, 158, 11, 0.18);
  --color-accent-danger: #ef4444;
  --color-accent-success: #22c55e;
  --color-accent-warning: #eab308;
  --color-text-primary: #fafafa;
  --color-text-secondary: #a3a3a3;
  --color-text-muted: #737373;
  --color-border: rgba(255, 255, 255, 0.06);
  --color-border-hover: rgba(255, 255, 255, 0.1);

  --font-family-sans: Inter, system-ui, sans-serif;
  --font-family-mono: JetBrains Mono, Fira Code, monospace;

  --animate-fade-in: fadeIn 200ms ease-out;
  --animate-slide-up: slideUp 250ms ease-out;
  --animate-scale-in: scaleIn 200ms ease-out;
  --animate-card-in: cardIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --animate-bounce-in: bounceIn 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --animate-glow-pulse: glowPulse 2s ease-in-out infinite;

  @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes slideUp { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { 0% { opacity: 0; transform: scale(0.92); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes cardIn { 0% { opacity: 0; transform: perspective(800px) rotateY(15deg) scale(0.85) translateY(20px); } 100% { opacity: 1; transform: perspective(800px) rotateY(0) scale(1) translateY(0); } }
  @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.08); } 70% { transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 4px rgba(245,158,11,0.15); } 50% { box-shadow: 0 0 18px rgba(245,158,11,0.35); } }
}

@layer base {
  body {
    background-color: var(--color-surface);
    color: var(--color-text-primary);
    font-family: var(--font-family-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
}

@layer utilities {
  .touch-target { min-height: 44px; min-width: 44px; }
  .text-balance { text-wrap: balance; }
}
```

- [ ] **Step 2: Create src/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorstFriend - Amigos de Merda",
  description: "O jogo que vai destruir suas amizades",
  icons: { icon: "/crown.svg", shortcut: "/crown.svg", apple: "/crown.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body className="bg-surface text-text-primary min-h-dvh">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Create public/crown.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="M12 48L6 20l12 8 14-18 14 18 12-8-6 28H12z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/>
  <path d="M12 48h40v6a2 2 0 01-2 2H14a2 2 0 01-2-2v-6z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
  <circle cx="32" cy="46" r="3" fill="#d97706"/>
</svg>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx public/crown.svg
git commit -m "feat: tailwind theme, root layout, and crown icon"
```

---

### Task 10: Home Page + Rules Modal

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/rules-modal.tsx`

- [ ] **Step 1: Create src/components/rules-modal.tsx**

```tsx
"use client";

import { useState } from "react";
import { BookOpen, X } from "lucide-react";

export default function RulesModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-all duration-200 touch-target z-40"
      >
        <BookOpen size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-surface/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-surface-raised border border-border p-6 space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">Regras do Jogo</h2>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary transition-colors touch-target">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-text-secondary">
              <div>
                <h3 className="font-bold text-brand-light mb-1">Objetivo</h3>
                <p>Seja o primeiro a acumular o numero de cartas definido (4, 5 ou 7) para ser coroado o <strong>Amigo de Merda</strong>.</p>
              </div>

              <div>
                <h3 className="font-bold text-brand-light mb-1">Como Jogar</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>O sistema revela uma carta com uma pergunta.</li>
                  <li>Todos tem <strong>5 segundos</strong> para votar em quem melhor se encaixa na pergunta.</li>
                  <li>NAO pode votar em si mesmo.</li>
                  <li>Votos sao secretos ate o fim do tempo.</li>
                  <li>Quem nao votar no prazo, perde o voto.</li>
                </ol>
              </div>

              <div>
                <h3 className="font-bold text-brand-light mb-1">Pontuacao</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>O jogador mais votado ganha a carta.</li>
                  <li>Empate: ninguem ganha a carta.</li>
                  <li>Primeiro a atingir o numero de cartas definido vence.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Create src/app/page.tsx**

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { connectSocket, getSocket } from "@/lib/socket";
import { setupSocketListeners, useGameStore } from "@/lib/store";
import { Room } from "@/game-engine/types";
import { Crown, Users, LogIn, ArrowRight } from "lucide-react";
import RulesModal from "@/components/rules-modal";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [cardsToWin, setCardsToWin] = useState<number>(5);
  const { error, setError } = useGameStore();

  useEffect(() => { setupSocketListeners(); connectSocket(); }, []);

  useEffect(() => {
    const socket = getSocket();
    function onRoomState(room: Room) { router.push(`/sala/${room.code}`); }
    socket.on("room:state", onRoomState);
    return () => { socket.off("room:state", onRoomState); };
  }, [router]);

  const handleCreate = useCallback(() => {
    if (!name.trim()) { setError("Digite seu nome"); return; }
    getSocket().emit("room:create", { playerName: name.trim() });
  }, [name, setError]);

  const handleJoin = useCallback(() => {
    if (!name.trim()) { setError("Digite seu nome"); return; }
    if (!roomCode.trim()) { setError("Digite o codigo da sala"); return; }
    getSocket().emit("room:join", { roomCode: roomCode.trim().toUpperCase(), playerName: name.trim() });
  }, [name, roomCode, setError]);

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md space-y-10 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Crown size={72} className="text-brand-light animate-float drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-text-primary tracking-tight">
              Amigos de Merda
            </h1>
            <p className="text-text-secondary text-lg mt-1 font-medium">WorstFriend</p>
          </div>
          <p className="text-text-muted text-sm">Jogo de votacao • 3+ jogadores</p>
        </div>

        <div className="space-y-4">
          <input
            className="w-full px-5 py-4 rounded-2xl bg-surface-raised border-2 border-border text-text-primary
                       placeholder:text-text-muted/50 focus:outline-none focus:border-brand/40 focus:bg-surface-card
                       transition-all duration-300 text-lg font-medium touch-target"
            placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} maxLength={20}
          />

          <div className="flex gap-2">
            {[4, 5, 7].map((n) => (
              <button key={n} onClick={() => setCardsToWin(n)}
                className={`flex-1 flex items-center justify-center gap-1 px-4 py-3 rounded-2xl border-2 text-sm font-bold transition-all duration-300 touch-target ${
                  cardsToWin === n ? "border-brand/50 bg-brand/10 text-brand-light shadow-lg shadow-brand/10" : "border-border bg-surface-raised text-text-muted hover:border-border"
                }`}>
                {n} cartas
              </button>
            ))}
          </div>

          <button onClick={handleCreate}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl
                       bg-gradient-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand
                       active:scale-[0.98] text-black font-black text-lg
                       transition-all duration-200 touch-target shadow-2xl shadow-brand/30">
            <Users size={22} />Criar Sala<ArrowRight size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-text-muted text-xs font-medium">ou entre em uma sala</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 px-5 py-4 rounded-2xl bg-surface-raised border-2 border-border text-text-primary
                         placeholder:text-text-muted/50 text-center text-lg font-mono font-bold tracking-[0.4em] uppercase
                         focus:outline-none focus:border-brand/40 transition-all duration-300 touch-target"
              placeholder="CODIGO" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} maxLength={6}
            />
            <button onClick={handleJoin}
              className="px-7 py-4 rounded-2xl bg-surface-raised hover:bg-surface-card border-2 border-border hover:border-brand/30
                         text-text-primary font-bold text-lg transition-all duration-200 active:scale-[0.98] touch-target">
              <LogIn size={22} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="px-5 py-4 rounded-2xl bg-accent-danger/10 border-2 border-accent-danger/20 text-accent-danger text-sm font-medium text-center animate-slide-up">
            {error}
          </div>
        ) : null}
      </div>
      <RulesModal />
    </main>
  );
}
```

- [ ] **Step 3: Verify dev server starts**

Run: `npx tsx server.mts` — confirm it starts without errors, then Ctrl+C

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/rules-modal.tsx
git commit -m "feat: home page with create/join room and rules modal"
```

---

### Task 11: Lobby Page

**Files:**
- Create: `src/app/sala/[id]/page.tsx`

- [ ] **Step 1: Create src/app/sala/[id]/page.tsx**

```tsx
"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { Copy, Play, Users, Crown, WifiOff } from "lucide-react";
import RulesModal from "@/components/rules-modal";

export const dynamic = "force-dynamic";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const { room, myPlayerId } = useGameStore();

  useEffect(() => {
    if (!room) { router.push("/"); return; }
  }, [room, router]);

  useEffect(() => {
    const socket = getSocket();
    function onGameUpdate(updated: ReturnType<typeof useGameStore.getState>["room"]) {
      if (!updated) return;
      useGameStore.getState().setRoom(updated);
      if (updated.status !== "waiting") router.push(`/jogo/${params.id}`);
    }
    socket.on("room:state", onGameUpdate);
    return () => { socket.off("room:state", onGameUpdate); };
  }, [params.id, router]);

  if (!room) return null;

  const isHost = myPlayerId === room.host;
  const canStart = room.players.length >= 3;
  const handleStart = useCallback(() => {
    if (!canStart) return;
    getSocket().emit("game:start", { cardsToWin: room.cardsToWin });
  }, [canStart, room.cardsToWin]);
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(room.code).catch(() => {});
  }, [room.code]);
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }, []);

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md space-y-8 animate-scale-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-glow flex items-center justify-center">
            <Users size={32} className="text-brand-light" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Sala de Espera</h1>
          <p className="text-text-muted text-sm">{room.cardsToWin} cartas para vencer</p>
        </div>

        <div className="space-y-3">
          <div className="text-center p-4 rounded-xl bg-surface-raised border border-border">
            <p className="text-text-muted text-sm mb-2">Codigo da sala</p>
            <button onClick={handleCopyCode} className="group flex items-center justify-center gap-3 mx-auto text-3xl font-mono font-bold text-brand-light hover:text-brand tracking-[0.3em] transition-all duration-200 touch-target">
              {room.code}<Copy size={18} />
            </button>
            <p className="text-text-muted text-xs mt-2">Clique para copiar o codigo</p>
          </div>

          <div className="text-center p-4 rounded-xl bg-surface-raised border border-border">
            <button onClick={handleCopyLink} className="w-full text-center text-sm text-text-secondary hover:text-brand-light transition-colors">
              <Copy size={14} className="inline mr-1" />
              Copiar link da sala
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-text-secondary flex items-center gap-2"><Users size={16} />Jogadores</span>
            <span className="text-sm font-mono text-text-muted">{room.players.length}</span>
          </div>
          <div className="space-y-2">
            {room.players.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-4 rounded-xl bg-surface-raised border border-border animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className={`shrink-0 w-3 h-3 rounded-full transition-colors ${p.connected ? "bg-accent-success shadow-[0_0_6px_rgba(34,197,94,0.4)]" : "bg-accent-warning"}`} />
                <span className="flex-1 text-text-primary font-medium truncate">
                  {p.name}{p.id === myPlayerId ? <span className="text-text-muted ml-2 text-sm">(voce)</span> : null}
                </span>
                {p.id === room.host ? <span className="flex items-center gap-1 text-accent-warning text-xs font-semibold"><Crown size={14} />HOST</span> : null}
                {!p.connected ? <WifiOff size={14} className="text-accent-warning shrink-0" /> : null}
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button onClick={handleStart} disabled={!canStart}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 touch-target ${
              canStart ? "bg-accent-success text-white hover:bg-accent-success/90 active:scale-[0.98] shadow-lg shadow-accent-success/25"
                : "bg-surface-raised text-text-muted cursor-not-allowed border border-border"
            }`}>
            <Play size={22} />{canStart ? "Iniciar Partida" : "Aguardando jogadores... (min. 3)"}
          </button>
        ) : (
          <div className="text-center py-6"><p className="text-text-muted text-sm animate-pulse">Aguardando o host iniciar a partida...</p></div>
        )}
        <RulesModal />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/sala/
git commit -m "feat: lobby page with room code, link sharing, and player list"
```

---

### Task 12: Game Components — CardDisplay, PlayerGrid, VotePanel, VoteReveal

**Files:**
- Create: `src/components/card-display.tsx`
- Create: `src/components/player-grid.tsx`
- Create: `src/components/vote-panel.tsx`
- Create: `src/components/vote-reveal.tsx`
- Create: `src/components/game-board.tsx`
- Create: `src/components/game-result.tsx`

- [ ] **Step 1: Create src/components/card-display.tsx**

```tsx
"use client";

import { Card, Round } from "@/game-engine/types";

interface Props {
  card: Card;
  roundNumber: number;
  cardsToWin: number;
}

export default function CardDisplay({ card, roundNumber, cardsToWin }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto animate-card-in">
      <div className="flex items-center justify-between mb-3">
        <span className="px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs font-bold">
          Rodada {roundNumber}
        </span>
        <span className="text-text-muted text-xs font-medium">
          Primeiro a {cardsToWin} cartas vence
        </span>
      </div>

      <div className="p-6 rounded-2xl bg-surface-raised border border-border border-l-4 border-l-brand">
        <p className="text-lg text-text-primary font-medium leading-relaxed text-balance">
          &ldquo;{card.text}&rdquo;
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/player-grid.tsx**

```tsx
"use client";

import { Player } from "@/game-engine/types";
import { Crown } from "lucide-react";

interface Props {
  players: Player[];
  myPlayerId: string;
  winnerId: string | null;
  votesRevealed: boolean;
  voteCounts: Map<string, number>;
}

export default function PlayerGrid({ players, myPlayerId, winnerId, votesRevealed, voteCounts }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {players.map((p, i) => {
        const count = votesRevealed ? (voteCounts.get(p.id) || 0) : 0;
        const isWinner = votesRevealed && p.id === winnerId;
        const isMe = p.id === myPlayerId;

        return (
          <div
            key={p.id}
            className={`relative rounded-xl p-4 text-center border-2 transition-all duration-300 animate-slide-up ${
              isWinner
                ? "border-brand bg-brand/10 shadow-lg shadow-brand/20"
                : "border-border bg-surface-raised"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {p.isHost && (
              <Crown size={12} className="absolute top-2 right-2 text-accent-warning" />
            )}
            <p className={`font-semibold truncate ${isMe ? "text-brand-light" : "text-text-primary"}`}>
              {p.name}{isMe ? " (voce)" : ""}
            </p>
            <div className="mt-2 flex items-center justify-center gap-1">
              {Array.from({ length: p.cardsWon }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-sm bg-brand" />
              ))}
            </div>
            {votesRevealed && (
              <p className={`mt-1 text-sm font-bold ${isWinner ? "text-brand-light" : "text-text-muted"}`}>
                {count} {count === 1 ? "voto" : "votos"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create src/components/vote-panel.tsx**

```tsx
"use client";

import { Player } from "@/game-engine/types";

interface Props {
  players: Player[];
  myPlayerId: string;
  hasVoted: boolean;
  onVote: (targetId: string) => void;
  timeLeft: number;
}

export default function VotePanel({ players, myPlayerId, hasVoted, onVote, timeLeft }: Props) {
  const others = players.filter((p) => p.id !== myPlayerId);

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-center gap-3">
        <div className={`text-3xl font-mono font-black transition-colors duration-300 ${
          timeLeft <= 1 ? "text-accent-danger animate-pulse" : "text-brand-light"
        }`}>
          {timeLeft}s
        </div>
      </div>

      {hasVoted ? (
        <div className="text-center py-4">
          <p className="text-text-secondary text-sm animate-pulse">Voto registrado! Aguardando os outros...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-text-muted text-xs text-center">Escolha quem votar:</p>
          {others.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onVote(p.id)}
              className="w-full px-5 py-4 rounded-xl bg-surface-raised border-2 border-border
                         hover:border-brand/40 hover:bg-surface-card text-text-primary
                         font-medium text-lg transition-all duration-200 active:scale-[0.98] touch-target"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create src/components/vote-reveal.tsx**

```tsx
"use client";

import { Player, Round } from "@/game-engine/types";
import { useEffect, useState } from "react";

interface Props {
  round: Round;
  players: Player[];
  voteCounts: Map<string, number>;
}

export default function VoteReveal({ round, players, voteCounts }: Props) {
  const [step, setStep] = useState(0);
  const votes = round.votes;

  useEffect(() => {
    if (step < votes.length) {
      const timer = setTimeout(() => setStep((s) => s + 1), 500);
      return () => clearTimeout(timer);
    }
  }, [step, votes.length]);

  const winner = round.winnerId
    ? players.find((p) => p.id === round.winnerId)
    : null;

  const getName = (id: string) => players.find((p) => p.id === id)?.name ?? "?";

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 animate-fade-in">
      <div className="space-y-2">
        {votes.map((v, i) => (
          <div
            key={v.playerId}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-raised border border-border transition-all duration-300 ${
              i < step ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-text-primary font-medium">{getName(v.playerId)}</span>
            <span className="text-text-muted text-xs">→</span>
            <span className="text-brand-light font-bold">
              {v.targetId ? getName(v.targetId) : "nao votou"}
            </span>
          </div>
        ))}
      </div>

      {step >= votes.length && (
        <div className={`text-center p-4 rounded-xl border-2 animate-bounce-in ${
          winner
            ? "border-brand/30 bg-brand/10"
            : "border-border bg-surface-raised"
        }`}>
          {winner ? (
            <p className="text-lg font-bold text-brand-light">
              {winner.name} ganhou a carta! ({voteCounts.get(winner.id)} votos)
            </p>
          ) : (
            <p className="text-lg font-bold text-text-muted">
              Empate! Ninguem ganhou a carta.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create src/components/game-board.tsx**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { Round } from "@/game-engine/types";
import CardDisplay from "./card-display";
import PlayerGrid from "./player-grid";
import VotePanel from "./vote-panel";
import VoteReveal from "./vote-reveal";
import GameResult from "./game-result";
import RulesModal from "./rules-modal";

export default function GameBoard() {
  const { room, myPlayerId, gameResult } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(5);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundRef = useRef<number | null>(null);

  useEffect(() => {
    if (!room || !room.rounds.length) return;
    const currentRound = room.rounds[room.rounds.length - 1];

    if (room.status === "voting" && currentRound.roundNumber !== roundRef.current) {
      roundRef.current = currentRound.roundNumber;
      setTimeLeft(5);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (room.status !== "voting") {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.status, room?.rounds.length]);

  const handleVote = useCallback((targetId: string) => {
    getSocket().emit("game:vote", { targetId });
  }, []);

  if (!room || !myPlayerId) return null;

  if (room.status === "finished" && gameResult) {
    return <GameResult />;
  }

  const currentRound = room.rounds[room.rounds.length - 1];
  const hasVoted = currentRound
    ? currentRound.votes.some((v) => v.playerId === myPlayerId)
    : false;

  const voteCounts = new Map<string, number>();
  if (currentRound) {
    for (const v of currentRound.votes) {
      if (v.targetId) {
        voteCounts.set(v.targetId, (voteCounts.get(v.targetId) || 0) + 1);
      }
    }
  }

  return (
    <main className="min-h-dvh bg-surface p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-4 pb-24">
        {currentRound && (
          <>
            <CardDisplay
              card={currentRound.card}
              roundNumber={currentRound.roundNumber}
              cardsToWin={room.cardsToWin}
            />

            {room.status === "voting" && (
              <VotePanel
                players={room.players}
                myPlayerId={myPlayerId}
                hasVoted={hasVoted}
                onVote={handleVote}
                timeLeft={timeLeft}
              />
            )}

            {room.status === "revealing" && (
              <VoteReveal
                round={currentRound}
                players={room.players}
                voteCounts={voteCounts}
              />
            )}

            <PlayerGrid
              players={room.players}
              myPlayerId={myPlayerId}
              winnerId={currentRound.winnerId}
              votesRevealed={room.status === "revealing" || room.status === "finished"}
              voteCounts={voteCounts}
            />
          </>
        )}
      </div>
      <RulesModal />
    </main>
  );
}
```

- [ ] **Step 6: Create src/components/game-result.tsx**

```tsx
"use client";

import { useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { Crown, RotateCcw } from "lucide-react";
import RulesModal from "./rules-modal";

export default function GameResult() {
  const { gameResult, room, myPlayerId } = useGameStore();

  const handlePlayAgain = useCallback(() => {
    getSocket().emit("game:playAgain", {});
  }, []);

  if (!gameResult || !room || !myPlayerId) return null;

  const hasVoted = room.playAgainVotes.includes(myPlayerId);
  const connectedPlayers = room.players.filter((p) => p.connected).length;
  const voteProgress = room.playAgainVotes.length;

  return (
    <main className="min-h-dvh bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-bounce-in">
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 rounded-full bg-brand/10 border-2 border-brand flex items-center justify-center animate-glow-pulse">
            <Crown size={48} className="text-brand-light" />
          </div>

          {gameResult.isTie ? (
            <>
              <h2 className="text-3xl font-black text-text-primary">Empate!</h2>
              <p className="text-text-secondary">
                {gameResult.players.filter((p) => p.cardsWon === gameResult.players[0].cardsWon)
                  .map((p) => p.name).join(" e ")} empataram com {gameResult.players[0].cardsWon} cartas cada.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-black text-brand-light">
                {gameResult.winner.name}
              </h2>
              <p className="text-text-secondary text-lg">
                e o <strong className="text-brand-light">Amigo de Merda</strong>!
              </p>
              <p className="text-text-muted text-sm">
                com {gameResult.winner.cardsWon} cartas
              </p>
            </>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm text-text-muted font-medium px-1">Ranking</h3>
          {gameResult.players.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl border transition-all ${
                p.id === gameResult.winner.id && !gameResult.isTie
                  ? "border-brand/30 bg-brand/10"
                  : "border-border bg-surface-raised"
              }`}
            >
              <span className="text-text-muted font-mono text-sm w-6">#{i + 1}</span>
              <span className="flex-1 font-medium text-text-primary">{p.name}</span>
              <span className="text-brand-light font-bold">{p.cardsWon} cartas</span>
            </div>
          ))}
        </div>

        <button
          onClick={handlePlayAgain}
          disabled={hasVoted}
          className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl font-bold text-lg transition-all duration-200 touch-target ${
            hasVoted
              ? "bg-surface-raised text-text-muted cursor-not-allowed border border-border"
              : "bg-accent-success text-white hover:bg-accent-success/90 active:scale-[0.98] shadow-lg shadow-accent-success/25"
          }`}
        >
          <RotateCcw size={22} />
          {hasVoted ? "Aguardando outros jogadores..." : "Jogar Novamente"}
        </button>

        {connectedPlayers > 0 && (
          <div className="text-center space-y-1">
            <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${(voteProgress / connectedPlayers) * 100}%` }}
              />
            </div>
            <p className="text-text-muted text-xs">
              {voteProgress}/{connectedPlayers} votaram
            </p>
          </div>
        )}
      </div>
      <RulesModal />
    </main>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/
git commit -m "feat: all game components — cards, voting, reveal, results"
```

---

### Task 13: Game Page

**Files:**
- Create: `src/app/jogo/[id]/page.tsx`

- [ ] **Step 1: Create src/app/jogo/[id]/page.tsx**

```tsx
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameStore } from "@/lib/store";
import GameBoard from "@/components/game-board";

export const dynamic = "force-dynamic";

export default function GamePage() {
  const router = useRouter();
  const { room } = useGameStore();

  useEffect(() => {
    if (!room) { router.push("/"); return; }
  }, [room, router]);

  if (!room) return null;

  return <GameBoard />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/jogo/
git commit -m "feat: game page routing"
```

---

### Task 14: Run Full Dev Test

- [ ] **Step 1: Start the dev server**

Run: `npx tsx server.mts`

- [ ] **Step 2: Open browser to http://localhost:3000**

Verify:
- [ ] Home page loads with crown icon and "Amigos de Merda" title
- [ ] Can enter a name, select cards-to-win (4/5/7), and click "Criar Sala"
- [ ] Redirects to lobby with room code displayed
- [ ] Can copy code and link
- [ ] Player list shows the host with crown
- [ ] Rules modal opens from the button

- [ ] **Step 3: Test the game flow**

Open a second browser tab and join with the room code. Both players in lobby. Need a third to start (open a third tab). Start the game:

- [ ] Game starts with first card displayed
- [ ] 5-second timer shown
- [ ] Vote buttons appear for other players (not self)
- [ ] After voting, shows "Voto registrado"
- [ ] After timer or all votes, transitions to reveal
- [ ] Reveal shows who voted for whom (one by one animation)
- [ ] Winner/tie message shown
- [ ] Score updates
- [ ] Next round begins after transition delay
- [ ] Game ends when someone reaches N cards
- [ ] Crown screen shown with ranking
- [ ] Play Again voting works

- [ ] **Step 4: Stop the server (Ctrl+C)**

- [ ] **Step 5: Commit (if any fixes made)**

```bash
git add -A
git commit -m "fix: dev test adjustments"
```

---

### Task 15: E2E Tests

**Files:**
- Create: `tests/e2e/full-game.test.ts`

- [ ] **Step 1: Create tests/e2e/full-game.test.ts**

```ts
import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3000";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createClient(): Socket {
  return io(URL, { autoConnect: false, transports: ["websocket"] });
}

async function setupGame() {
  const host = createClient();
  const p2 = createClient();
  const p3 = createClient();

  const hostReady = new Promise<any>((resolve) => host.on("room:state", resolve));
  host.connect();
  host.emit("room:create", { playerName: "Host" });
  const room = await hostReady;
  const roomCode = room.code;

  return { host, p2, p3, room, roomCode };
}

describe("Full Game Flow", () => {
  it("complete game: create, join, vote, win", async () => {
    const { host, p2, p3, roomCode } = await setupGame();

    let p2id: string;
    let p3id: string;

    const p2Ready = new Promise<any>((resolve) => {
      p2.on("room:state", resolve);
      p2.on("player:id", (id: string) => { p2id = id; });
    });
    p2.connect();
    p2.emit("room:join", { roomCode, playerName: "Player2" });
    await p2Ready;

    const p3Ready = new Promise<any>((resolve) => {
      p3.on("room:state", resolve);
      p3.on("player:id", (id: string) => { p3id = id; });
    });
    p3.connect();
    p3.emit("room:join", { roomCode, playerName: "Player3" });
    await p3Ready;

    const gameStarted = new Promise<any>((resolve) => {
      p2.on("room:state", (state: any) => {
        if (state.status === "voting") resolve(state);
      });
    });
    host.emit("game:start", { cardsToWin: 5 });
    const gameState = await gameStarted;
    expect(gameState.status).toBe("voting");
    expect(gameState.rounds).toHaveLength(1);

    p2.emit("game:vote", { targetId: p3id });
    p3.emit("game:vote", { targetId: p2id });

    const revealDone = new Promise<any>((resolve) => {
      host.on("room:state", (state: any) => {
        if (state.status === "revealing") resolve(state);
      });
    });
    host.emit("game:vote", { targetId: p3id }); // p3 gets 2 votes

    const revealed = await revealDone;
    expect(revealed.status).toBe("revealing");
    expect(revealed.rounds[0].winnerId).toBe(p3id);

    host.disconnect();
    p2.disconnect();
    p3.disconnect();
  }, 15000);

  it("tie results in no winner", async () => {
    const { host, p2, p3, roomCode } = await setupGame();

    let p1id: string, p2id: string, p3id: string;

    const p2Ready = new Promise<any>((resolve) => {
      p2.on("room:state", resolve);
      p2.on("player:id", (id: string) => { p2id = id; });
    });
    p2.connect();
    p2.emit("room:join", { roomCode, playerName: "Player2" });
    await p2Ready;

    const p3Ready = new Promise<any>((resolve) => {
      p3.on("room:state", resolve);
      p3.on("player:id", (id: string) => { p3id = id; });
    });
    p3.connect();
    p3.emit("room:join", { roomCode, playerName: "Player3" });
    await p3Ready;

    host.on("player:id", (id: string) => { p1id = id; });

    const gameStarted = new Promise<any>((resolve) => {
      host.on("room:state", (state: any) => {
        if (state.status === "voting") resolve(state);
      });
    });
    host.emit("game:start", { cardsToWin: 5 });
    await gameStarted;

    host.emit("game:vote", { targetId: p3id });
    p2.emit("game:vote", { targetId: p1id });
    p3.emit("game:vote", { targetId: p2id }); // 1 vote each

    const revealDone = new Promise<any>((resolve) => {
      host.on("room:state", (state: any) => {
        if (state.status === "revealing") resolve(state);
      });
    });
    const revealed = await revealDone;
    expect(revealed.rounds[0].winnerId).toBeNull();

    host.disconnect();
    p2.disconnect();
    p3.disconnect();
  }, 15000);

  it("self-vote is rejected", async () => {
    const { host, p2, p3, roomCode } = await setupGame();

    let p1id: string;

    const p2Ready = new Promise<any>((resolve) => {
      p2.on("room:state", resolve);
    });
    p2.connect();
    p2.emit("room:join", { roomCode, playerName: "Player2" });
    await p2Ready;

    const p3Ready = new Promise<any>((resolve) => {
      p3.on("room:state", resolve);
    });
    p3.connect();
    p3.emit("room:join", { roomCode, playerName: "Player3" });
    await p3Ready;

    const errorPromise = new Promise<string>((resolve) => {
      host.on("error", ({ message }: { message: string }) => resolve(message));
    });
    host.on("player:id", (id: string) => { p1id = id; });

    const gameStarted = new Promise<any>((resolve) => {
      host.on("room:state", (state: any) => {
        if (state.status === "voting") resolve(state);
      });
    });
    host.emit("game:start", { cardsToWin: 5 });
    await gameStarted;

    host.emit("game:vote", { targetId: p1id });
    const error = await errorPromise;
    expect(error).toBe("Voce nao pode votar em si mesmo");

    host.disconnect();
    p2.disconnect();
    p3.disconnect();
  }, 15000);
});
```

- [ ] **Step 2: Start server and run E2E tests**

Run in terminal 1: `npx tsx server.mts`

Run in terminal 2: `npx vitest run tests/e2e/`

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/
git commit -m "test: e2e tests for full game flow, tie, and self-vote rejection"
```

---

### Task 16: Final Verification

- [ ] **Step 1: Run all unit tests**

Run: `npx vitest run src/tests/`

- [ ] **Step 2: Run all E2E tests (server must be running)**

Run: `npx vitest run tests/e2e/`

- [ ] **Step 3: Verify build**

Run: `npx next build --turbo`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final verification — all tests pass, build succeeds"
```
