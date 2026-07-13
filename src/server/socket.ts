import { Server as SocketIOServer, Socket } from "socket.io";
import { createRoom, joinRoom, removePlayer, setPlayerDisconnected } from "@/game-engine/room";
import { startGame, checkWinCondition } from "@/game-engine/game";
import { recordVote, resolveRound, startRound, allVotesIn } from "@/game-engine/round";
import { buildGameResult } from "@/game-engine/scoring";
import { shuffleDeck } from "@/game-engine/deck";
import {
  getRoom, setRoom, deleteRoom,
  mapSocketToPlayer, removeSocketMapping,
  getRoomBySocketId, getPlayerIdBySocketId,
} from "./rooms";
import { Room } from "@/game-engine/types";

const VOTE_TIMEOUT = 30000;
const DISCONNECT_TIMEOUT = 60000;

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Erro inesperado";
}

export function setupSocket(io: SocketIOServer): void {
  io.on("connection", (socket: Socket) => {

    socket.on("room:create", ({ playerName, cardsToWin }: { playerName: string; cardsToWin?: number }) => {
      if (!playerName?.trim()) {
        socket.emit("error", { message: "Nome não pode ser vazio" });
        return;
      }
      const room = createRoom(playerName.trim(), cardsToWin && [4, 5, 7].includes(cardsToWin) ? cardsToWin : 5);
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
        socket.emit("error", { message: "Sala não encontrada" });
        return;
      }
      if (!playerName?.trim()) {
        socket.emit("error", { message: "Nome não pode ser vazio" });
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
      } catch (e) {
        socket.emit("error", { message: getErrorMessage(e) });
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
        startVoteTimer(room.code, io);
      } catch (e) {
        socket.emit("error", { message: getErrorMessage(e) });
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
      const room = getRoomBySocketId(socket.id);
      if (!room || room.status !== "revealing") return;
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
        const freshDeck = nextIndex >= room.deck.length ? shuffleDeck() : room.deck;
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
