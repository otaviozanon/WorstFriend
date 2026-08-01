import { Server as SocketIOServer, Socket } from "socket.io";
import { createRoom, joinRoom, removePlayer, setPlayerDisconnected, setPlayerReconnected } from "@/game-engine/room";
import { startGame, checkWinCondition } from "@/game-engine/game";
import { recordVote, resolveRound, startRound, allVotesIn } from "@/game-engine/round";
import { buildGameResult } from "@/game-engine/scoring";
import { shuffleDeck } from "@/game-engine/deck";
import {
  getRoom, setRoom, deleteRoom, getAllRooms,
  mapSocketToPlayer, removeSocketMapping,
  getRoomBySocketId, getPlayerIdBySocketId,
  getPlayerSocketId,
} from "./rooms";
import { Room, CardCategory, GameError } from "@/game-engine/types";

const VALID_CATEGORIES: CardCategory[] = ["ácida_extrema", "+18"];

function sanitizeCategories(input?: string[]): CardCategory[] {
  if (!input || !input.length) return ["ácida_extrema"];
  return input.filter((c): c is CardCategory => (VALID_CATEGORIES as string[]).includes(c));
}

const VOTE_TIMEOUT = 30000;
const DISCONNECT_TIMEOUT = 60000;
const ROOM_CLEANUP_INTERVAL = 300000;
const RATE_LIMIT_WINDOW = 500;

const rateLimiters = new Map<string, Map<string, number>>();

function checkRateLimit(socketId: string, event: string): boolean {
  const now = Date.now();
  let tracker = rateLimiters.get(socketId);
  if (!tracker) {
    tracker = new Map();
    rateLimiters.set(socketId, tracker);
  }
  const last = tracker.get(event) || 0;
  if (now - last < RATE_LIMIT_WINDOW) {
    return false;
  }
  tracker.set(event, now);
  return true;
}

function getErrorMessage(e: unknown): string {
  if (e instanceof GameError) return e.message;
  return e instanceof Error ? e.message : "Erro inesperado";
}

function cleanupStaleRooms(io: SocketIOServer): void {
  const now = Date.now();
  for (const [code, room] of getAllRooms()) {
    const hasConnected = room.players.some((p) => p.connected);
    if (!hasConnected) {
      clearVoteTimer(code);
      for (const player of room.players) {
        const sid = getPlayerSocketId(player.id);
        if (sid) removeSocketMapping(sid);
      }
      deleteRoom(code);
    }
  }
}

export function setupSocket(io: SocketIOServer): void {
  const cleanupTimer = setInterval(() => cleanupStaleRooms(io), ROOM_CLEANUP_INTERVAL);

  io.on("connection", (socket: Socket) => {

    socket.on("player:reconnect", ({ roomCode, playerId }: { roomCode: string; playerId: string }) => {
      const normalizedCode = roomCode?.trim().toUpperCase();
      if (!normalizedCode || !playerId) return;
      const room = getRoom(normalizedCode);
      if (!room) {
        socket.emit("error", { message: "Sala não encontrada" });
        return;
      }
      const player = room.players.find((p) => p.id === playerId);
      if (!player || player.connected) {
        socket.emit("error", { message: "Jogador não encontrado" });
        return;
      }
      const reconnected = setPlayerReconnected(room, playerId);
      setRoom(normalizedCode, reconnected);
      mapSocketToPlayer(socket.id, normalizedCode, playerId);
      socket.join(normalizedCode);
      socket.emit("player:id", playerId);
      io.to(normalizedCode).emit("room:state", reconnected);
    });

    socket.on("room:create", ({ playerName, cardsToWin, categories }: { playerName: string; cardsToWin?: number; categories?: string[] }) => {
      if (!playerName?.trim()) {
        socket.emit("error", { message: "Nome não pode ser vazio" });
        return;
      }
      try {
        const room = createRoom(
          playerName.trim(),
          cardsToWin && [4, 5, 7].includes(cardsToWin) ? cardsToWin : 5,
          sanitizeCategories(categories),
          getRoom,
        );
        setRoom(room.code, room);
        const player = room.players[0];
        mapSocketToPlayer(socket.id, room.code, player.id);
        socket.join(room.code);
        socket.emit("player:id", player.id);
        socket.emit("room:state", room);
      } catch (e) {
        socket.emit("error", { message: getErrorMessage(e) });
      }
    });

    socket.on("room:join", ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
      const normalizedCode = roomCode?.trim().toUpperCase();
      const room = getRoom(normalizedCode);
      if (!room) {
        socket.emit("error", { message: "Sala não encontrada" });
        return;
      }
      if (!playerName?.trim()) {
        socket.emit("error", { message: "Nome não pode ser vazio" });
        return;
      }
      try {
        const updated = joinRoom(room, playerName.trim());
        setRoom(normalizedCode, updated);
        const player = updated.players[updated.players.length - 1];
        mapSocketToPlayer(socket.id, normalizedCode, player.id);
        socket.join(normalizedCode);
        socket.emit("player:id", player.id);
        io.to(normalizedCode).emit("room:state", updated);
      } catch (e) {
        socket.emit("error", { message: getErrorMessage(e) });
      }
    });

    socket.on("game:start", () => {
      if (!checkRateLimit(socket.id, "game:start")) return;
      const room = getRoomBySocketId(socket.id);
      if (!room) return;
      const playerId = getPlayerIdBySocketId(socket.id);
      if (room.host !== playerId) {
        socket.emit("error", { message: "Apenas o host pode iniciar" });
        return;
      }
      try {
        const playing = startGame(room);
        setRoom(room.code, playing);
        io.to(room.code).emit("room:state", playing);
        startVoteTimer(room.code, io);
      } catch (e) {
        socket.emit("error", { message: getErrorMessage(e) });
      }
    });

    socket.on("game:vote", ({ targetId }: { targetId: string }) => {
      if (!checkRateLimit(socket.id, "game:vote")) return;
      const room = getRoomBySocketId(socket.id);
      if (!room || room.status !== "voting") return;
      const playerId = getPlayerIdBySocketId(socket.id);
      if (!playerId) return;
      try {
        const updated = recordVote(room, playerId, targetId);
        setRoom(room.code, updated);
        io.to(room.code).emit("room:state", updated);
        if (allVotesIn(updated)) {
          clearVoteTimer(room.code);
          finishVoting(room.code, updated, io, true);
        }
      } catch (e) {
        socket.emit("error", { message: getErrorMessage(e) });
      }
    });

    socket.on("game:nextRound", () => {
      if (!checkRateLimit(socket.id, "game:nextRound")) return;
      const room = getRoomBySocketId(socket.id);
      if (!room || room.status !== "revealing") return;
      if (!room.rounds[room.rounds.length - 1]?.votesRevealed) return;
      const playerId = getPlayerIdBySocketId(socket.id);
      if (room.host !== playerId) {
        socket.emit("error", { message: "Apenas o host pode avançar" });
        return;
      }
      if (checkWinCondition(room)) {
        const winnerId = buildGameResult(room.players).winner.id;
        const finished = { ...room, status: "finished" as const, winnerId };
        setRoom(room.code, finished);
        io.to(room.code).emit("room:state", finished);
        io.to(room.code).emit("game:end", buildGameResult(room.players));
      } else {
        const nextRound = startRound({ ...room, status: "playing" });
        setRoom(room.code, nextRound);
        io.to(room.code).emit("room:state", nextRound);
        startVoteTimer(room.code, io);
      }
    });

    socket.on("game:playAgain", () => {
      if (!checkRateLimit(socket.id, "game:playAgain")) return;
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
        const nextIndex = room.currentCardIndex;
        const freshDeck = nextIndex >= room.deck.length ? shuffleDeck(room.categories) : room.deck;
        const resetRoom: Room = {
          ...room,
          status: "playing",
          cardsToWin: room.cardsToWin,
          currentCardIndex: nextIndex >= room.deck.length ? 0 : nextIndex,
          rounds: [],
          winnerId: null,
          playAgainVotes: [],
          deck: freshDeck,
          players: room.players.map((p) => ({
            ...p,
            cardsWon: 0,
          })),
        };
        const restarted = startRound(resetRoom);
        setRoom(room.code, restarted);
        io.to(room.code).emit("room:state", restarted);
        startVoteTimer(room.code, io);
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

      if (updated.status === "voting" && allVotesIn(updated)) {
        clearVoteTimer(mapping.roomCode);
        finishVoting(mapping.roomCode, updated, io, true);
      }

      setTimeout(() => {
        const r = getRoom(mapping.roomCode);
        if (r) {
          const p = r.players.find((x) => x.id === mapping.playerId);
          if (p && !p.connected) {
            const cleaned = removePlayer(r, mapping.playerId);
            if (cleaned.players.length === 0) {
              clearVoteTimer(mapping.roomCode);
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

  io.engine.on("close", () => {
    clearInterval(cleanupTimer);
  });
}

const voteTimers = new Map<string, ReturnType<typeof setTimeout>>();

function startVoteTimer(roomCode: string, io: SocketIOServer): void {
  clearVoteTimer(roomCode);
  voteTimers.set(roomCode, setTimeout(() => {
    const current = getRoom(roomCode);
    if (current && current.status === "voting") {
      finishVoting(roomCode, current, io, false);
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

function finishVoting(roomCode: string, room: Room, io: SocketIOServer, immediate: boolean): void {
  const resolved = resolveRound(room);
  setRoom(roomCode, resolved);
  io.to(roomCode).emit("room:state", resolved);
}
