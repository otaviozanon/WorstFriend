<p align="center">
  <img src="./public/poop.svg" width="120" alt="WorstFriend" />
</p>

<h1 align="center">WorstFriend</h1>
<p align="center"><strong>Amigos de M*</strong> — Versao online do classico jogo de cartas brasileiro</p>

<p align="center">
  <img src="https://img.shields.io/badge/jogadores-3%2B-orange" />
  <img src="https://img.shields.io/badge/cartas-4%2C%205%20ou%207-yellow" />
  <img src="https://img.shields.io/badge/perguntas-150-red" />
  <img src="https://img.shields.io/badge/multiplayer-online-green" />
</p>

---

## Como Jogar

O sistema revela uma carta com uma pergunta constrangedora. Todos tem **30 segundos** para votar em quem melhor se encaixa na descricao. Nao pode votar em si mesmo, e os votos sao secretos ate o fim do tempo.

O jogador mais votado **ganha a carta**. O primeiro a acumular o numero de cartas definido (4, 5 ou 7) e coroado o <strong>Amigo de M*</strong>.

<p align="center">
  <em>"Quem tem mais cara de quem peida silenciosamente?"<br />"Quem seria o primeiro a morrer em um apocalipse zumbi?"<br />"Quem e o pior motorista do grupo?"</em>
</p>

---

## Tecnologia

- **Frontend:** React 19 + Next.js 15
- **Estilizacao:** Tailwind CSS 4
- **Estado:** Zustand
- **Tempo real:** Socket.IO
- **Icones:** Lucide React
- **Testes:** Vitest + Testing Library
- **Runtime:** Node.js (servidor WebSocket customizado)

---

## Como Rodar

```bash
# Instalar dependencias
npm install

# Desenvolvimento (Next.js + WebSocket server)
npm run dev

# Build de producao
npm run build

# Iniciar em producao
npm start
```

---

## Testes

```bash
# Rodar todos os testes
npm test

# Modo watch
npm run test:watch
```

---

## Estrutura do Projeto

```
src/
  app/              # Rotas Next.js (App Router)
    page.tsx        # Landing page (criar/entrar sala)
    sala/[id]/      # Sala de espera
    jogo/[id]/      # Jogo em andamento
  components/       # Componentes React
    rules-modal.tsx # Modal de regras
    card-display.tsx
    game-board.tsx
    player-grid.tsx
    vote-panel.tsx
    vote-reveal.tsx
    game-result.tsx
  game-engine/      # Logica do jogo (server-side)
    game.ts         # Maquina de estados do jogo
    room.ts         # Gerenciamento de salas
    deck.ts         # Baralho de cartas
    round.ts        # Controle de rodadas
    scoring.ts      # Pontuacao
  cards/
    data.ts         # Dados das cartas/perguntas
  server/
    socket.ts       # Servidor WebSocket (Socket.IO)
    rooms.ts        # Gerenciamento de salas no servidor
  lib/
    store.ts        # Store Zustand (estado do cliente)
    socket.ts       # Cliente Socket.IO
tests/              # Testes do game-engine
  game-engine/
    deck.test.ts
    game.test.ts
    room.test.ts
    round.test.ts
    scoring.test.ts
```

---

## Como Jogar Online

1. Crie uma sala e compartilhe o **codigo de 6 digitos** ou o link
2. Seus amigos entram na sala (3+ jogadores, sem limite)
3. O host escolhe **4, 5 ou 7 cartas** para vencer
4. **30 segundos** por rodada para votar. O mais votado ganha a carta!

---

## 150 Cartas

Perguntas sobre comportamentos, habitos questionaveis e situacoes constrangedoras entre amigos — do classico "Quem peida no elevador?" ao profundo "Quem venderia a alma por um combo do McDonalds?".

---

<p align="center">
  Feito com 💩 por amigos que nao se levam a serio<br />
  Jogo original: <strong>Amigos de Merda</strong> por Buró Brasil
</p>
