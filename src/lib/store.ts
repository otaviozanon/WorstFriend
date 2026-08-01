import { create } from "zustand";
import { Room, GameResult } from "@/game-engine/types";
import { getSocket } from "./socket";

const RECONNECT_KEY = "worstfriend-reconnect";

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

  setRoom: (room) => {
    if (room.code) {
      const existing = JSON.parse(sessionStorage.getItem(RECONNECT_KEY) || "{}");
      const state = useGameStore.getState();
      if (state.myPlayerId) {
        sessionStorage.setItem(RECONNECT_KEY, JSON.stringify({ roomCode: room.code, playerId: state.myPlayerId }));
      } else {
        sessionStorage.setItem(RECONNECT_KEY, JSON.stringify({ ...existing, roomCode: room.code }));
      }
    }
    set({ room, error: null });
  },
  setMyPlayerId: (id) => {
    const existing = JSON.parse(sessionStorage.getItem(RECONNECT_KEY) || "{}");
    sessionStorage.setItem(RECONNECT_KEY, JSON.stringify({ ...existing, playerId: id }));
    set({ myPlayerId: id });
  },
  setGameResult: (result) => set({ gameResult: result }),
  setError: (error) => set({ error }),
  reset: () => {
    sessionStorage.removeItem(RECONNECT_KEY);
    set({ room: null, myPlayerId: null, gameResult: null, error: null });
  },
}));

let listenersSetup = false;
let errorTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempted = false;

export function setupSocketListeners(): void {
  if (listenersSetup) return;
  listenersSetup = true;
  const socket = getSocket();

  socket.on("connect", () => {
    if (!reconnectAttempted) {
      reconnectAttempted = true;
      const stored = sessionStorage.getItem(RECONNECT_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.roomCode && data.playerId) {
            socket.emit("player:reconnect", { roomCode: data.roomCode, playerId: data.playerId });
          }
        } catch { /* ignore */ }
      }
    }
  });

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

  socket.on("error", ({ message }: { message: string }) => {
    useGameStore.getState().setError(message);
    if (errorTimer !== null) clearTimeout(errorTimer);
    errorTimer = setTimeout(() => useGameStore.getState().setError(null), 5000);
  });

  socket.on("disconnect", () => {
    useGameStore.getState().setError("Conexao perdida. Tentando reconectar...");
  });
}

export function teardownSocketListeners(): void {
  const socket = getSocket();
  socket.off("connect");
  socket.off("room:state");
  socket.off("player:id");
  socket.off("game:end");
  socket.off("error");
  socket.off("disconnect");
  if (errorTimer !== null) {
    clearTimeout(errorTimer);
    errorTimer = null;
  }
  listenersSetup = false;
}
