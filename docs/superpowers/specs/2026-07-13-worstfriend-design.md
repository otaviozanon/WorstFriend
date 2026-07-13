# WorstFriend Design Spec

**Date:** 2026-07-13
**Project:** WorstFriend — Versao online do jogo "Amigos de Merda" (Buro Brasil)

## Overview

Versao web multiplayer do jogo de cartas brasileiro "Amigos de Merda". Jogadores em uma sala respondem a perguntas sociais votando uns nos outros. Primeiro a acumular N cartas (4, 5 ou 7) e coroado "Amigo de Merda".

## Game Rules (Modo Basico)

- **84 cartas** de perguntas (sem expansao Sacana, sem cartas customizadas)
- **3+ jogadores** por sala, sem limite maximo
- Host escolhe **4, 5 ou 7 cartas** para vencer
- Primeiro jogador definido **aleatoriamente** (nao usado — cartas sao reveladas automaticamente)
- Cartas reveladas **automaticamente** pelo sistema
- Votacao com **timer sincrono de 5 segundos** + confirmacao individual
- **Voto cego** — votos ficam ocultos ate todos votarem ou timer estourar
- Nao pode votar em si mesmo
- Quem nao votar no prazo **perde o voto**
- **Empate = ninguem ganha** a carta (sem mecanismo de desempate)
- Quem atingir N cartas primeiro e coroado **Amigo de Merda**
- Tela de vitoria com **animacao de coroacao**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Runtime | React 19 |
| Language | TypeScript 5.8 |
| Real-time | Socket.IO 4.7 (client + server) |
| State | Zustand 4.5 |
| Styling | Tailwind CSS 4 + PostCSS |
| Icons | Lucide React |
| Server | Custom Node.js HTTP server (tsx) — single port 3000 |
| Testing | Vitest + Testing Library + jsdom |
| Storage | In-memory (Map) — no database |

## Architecture

Same pattern as NoWay: custom HTTP server wraps Next.js + Socket.IO on single port. All game state is server-authoritative and held in memory. No authentication — players enter only a display name.

```
Client (React + Zustand) ←→ Socket.IO ←→ Server (Node.js + Map storage)
                                    ←→ Next.js (HTTP, pages)
```

## UI Theme

Dark theme with NoWay palette:
- Background: `#050505`
- Surface: dark grays
- Accent: amber (`#f5a623`)
- Font: Inter (sans), JetBrains Mono (monospace)
- Tone: irreverent, bold, matching the original game's personality

## Project Structure

```
WorstFriend/
├── public/
│   └── crown.svg                    # Coroa icon
├── src/
│   ├── app/
│   │   ├── globals.css              # Tailwind + NoWay palette
│   │   ├── layout.tsx               # Root layout (metadata)
│   │   ├── page.tsx                 # Home: name input, create/join room
│   │   ├── sala/[id]/page.tsx       # Lobby: room code, link, player list, start
│   │   └── jogo/[id]/page.tsx       # Game: card, voting, results
│   ├── cards/
│   │   └── data.ts                  # 84 cards (questions array)
│   ├── components/
│   │   ├── card-display.tsx         # Current card with theme accent
│   │   ├── game-board.tsx           # Main game orchestrator
│   │   ├── player-grid.tsx          # Player avatars + cards won counters
│   │   ├── vote-panel.tsx           # Voting UI (timer, player buttons)
│   │   ├── vote-reveal.tsx          # Reveal animation (who voted who)
│   │   ├── game-result.tsx          # End screen (crown, ranking)
│   │   └── rules-modal.tsx          # Rules overlay
│   ├── game-engine/
│   │   ├── types.ts                 # Player, Card, Room, Round, Vote
│   │   ├── deck.ts                  # Shuffle, draw
│   │   ├── room.ts                  # Create, join, leave, host transfer
│   │   ├── round.ts                 # Start round, record vote, resolve
│   │   ├── game.ts                  # Orchestrate rounds, check win condition
│   │   └── scoring.ts               # Rank players, determine winner
│   ├── lib/
│   │   ├── socket.ts                # Socket.IO client singleton
│   │   └── store.ts                 # Zustand global state
│   └── server/
│       ├── rooms.ts                 # In-memory Map<string, Room>
│       └── socket.ts                # All Socket.IO event handlers
├── server.mts                        # Custom HTTP + Socket.IO entry point
├── package.json
├── tsconfig.json
├── tsconfig.server.json
├── next.config.js
├── postcss.config.js
└── vitest.config.ts
```

## Data Model

```typescript
interface Player {
  id: string;
  name: string;
  connected: boolean;
  cardsWon: number;
  isHost: boolean;
}

interface Card {
  id: number;
  text: string;
}

interface Vote {
  voterId: string;
  targetId: string | null;  // null = didn't vote
}

interface Round {
  roundNumber: number;
  card: Card;
  votes: Vote[];
  votesRevealed: boolean;
  winnerId: string | null;  // null = tie
}

type RoomStatus = 'waiting' | 'voting' | 'revealing' | 'finished';

interface Room {
  code: string;
  players: Player[];
  status: RoomStatus;
  cardsToWin: number;
  deck: Card[];
  currentCardIndex: number;
  rounds: Round[];
  timerSeconds: number;       // 5
  winnerId: string | null;
}
```

## Socket.IO Events

```
Client -> Server:
  room:create          { name }                         -> player:id, room:state
  room:join            { code, name }                   -> player:id, room:state
  game:start           { cardsToWin }                   -> room:state (host only)
  game:vote            { targetId }                     -> room:state
  game:playAgain       {}                               -> room:state

Server -> Client(s):
  player:id            { id }                            (individual)
  room:state           Room                               (broadcast)
  error                { message }                        (individual)
```

## Round Flow

1. **Reveal Card** — System draws next card, shows it to all players. 5-second timer starts.
2. **Voting** — Each player clicks a target. Votes are hidden. Must vote before timer expires. Cannot self-vote.
3. **Reveal** — Timer expires or all voted. Votes revealed with animation. Most-voted player gets the card.
4. **Transition** — Score updates. If a player reached N cards → game ends with crown screen. Otherwise → next round.

## Edge Cases

- **Disconnect during voting:** vote marked null (forfeit)
- **Player leaves room:** removed, their won cards stay in history
- **Host leaves:** host transfers to next connected player
- **Everyone leaves:** room destroyed
- **< 3 players:** game cannot start
- **Self-vote:** blocked in UI, validated on server
- **Reconnection:** on page reload, reconnect by playerId + roomCode if room still exists

## Out of Scope

- Sacana expansion (pink cards)
- Custom/blank cards
- Invisible Friend variant
- Alcoholic variant
- Image generation for sharing
- Authentication/user accounts
