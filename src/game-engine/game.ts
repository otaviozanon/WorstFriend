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
