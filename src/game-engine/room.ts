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
    timerSeconds: 15,
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
