import { Room, Player, CardCategory, GameError, MAX_PLAYERS } from "./types";
import { shuffleDeck } from "./deck";

function generateId(): string {
  return crypto.randomUUID();
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createRoom(
  playerName: string,
  cardsToWin: number = 5,
  categories: CardCategory[] = ["ácida_extrema"],
  getRoomFn?: (code: string) => Room | undefined,
): Room {
  const playerId = generateId();
  const hostPlayer: Player = {
    id: playerId,
    name: playerName,
    cardsWon: 0,
    connected: true,
    isHost: true,
  };

  let code: string;
  let attempts = 0;
  do {
    code = generateRoomCode();
    attempts++;
  } while (getRoomFn?.(code) && attempts < 100);

  const deck = shuffleDeck(categories);
  if (deck.length === 0) {
    throw new GameError("EMPTY_DECK");
  }

  return {
    code,
    host: playerId,
    players: [hostPlayer],
    status: "waiting",
    cardsToWin,
    categories,
    deck,
    currentCardIndex: 0,
    rounds: [],
    timerSeconds: 30,
    winnerId: null,
    playAgainVotes: [],
  };
}

export function joinRoom(room: Room, playerName: string): Room {
  if (room.status !== "waiting") {
    throw new GameError("GAME_IN_PROGRESS");
  }
  if (room.players.length >= MAX_PLAYERS) {
    throw new GameError("ROOM_FULL");
  }
  if (room.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) {
    throw new GameError("DUPLICATE_NAME");
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
  return { ...room, players: updatedPlayers, host: updatedHost, playAgainVotes: room.playAgainVotes.filter((id) => id !== playerId) };
}

export function setPlayerDisconnected(room: Room, playerId: string): Room {
  return {
    ...room,
    players: room.players.map((p) =>
      p.id === playerId ? { ...p, connected: false } : p,
    ),
  };
}

export function setPlayerReconnected(room: Room, playerId: string): Room {
  return {
    ...room,
    players: room.players.map((p) =>
      p.id === playerId ? { ...p, connected: true } : p,
    ),
  };
}

export function findPlayer(room: Room, playerId: string): Player | undefined {
  return room.players.find((p) => p.id === playerId);
}
