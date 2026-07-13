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

const VOTE_TIMEOUT = 30000;
const REVEAL_DELAY = 3000;
const REVEAL_FAST = 500;
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
          finishVoting(room.code, updated, io, true);
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
  }, immediate ? REVEAL_FAST : REVEAL_DELAY);
}
