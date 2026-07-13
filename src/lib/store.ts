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
