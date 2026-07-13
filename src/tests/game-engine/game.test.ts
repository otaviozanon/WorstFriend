import { describe, it, expect } from "vitest";
import { startGame, isGameOver, checkWinCondition } from "@/game-engine/game";
import { createRoom, joinRoom } from "@/game-engine/room";

function makeRoom(players: string[]): ReturnType<typeof createRoom> {
  let room = createRoom(players[0]);
  for (let i = 1; i < players.length; i++) {
    room = joinRoom(room, players[i]);
  }
  return room;
}

describe("startGame", () => {
  it("transitions room to playing status and starts first round", () => {
    let room = makeRoom(["Alice", "Bob", "Charlie"]);
    room = { ...room, cardsToWin: 5 };
    const playing = startGame(room);
    expect(playing.status).toBe("voting");
    expect(playing.rounds).toHaveLength(1);
  });

  it("throws if fewer than 3 players", () => {
    const room = makeRoom(["Alice", "Bob"]);
    expect(() => startGame(room)).toThrow("Minimo de 3 jogadores");
  });
});

describe("checkWinCondition", () => {
  it("returns true when a player has cardsToWin cards", () => {
    let room = makeRoom(["Alice", "Bob", "Charlie"]);
    room = { ...room, cardsToWin: 5, status: "playing" };
    room = {
      ...room,
      players: room.players.map((p) =>
        p.id === room.players[0].id ? { ...p, cardsWon: 5 } : p,
      ),
    };
    expect(checkWinCondition(room)).toBe(true);
  });

  it("returns false when no one has enough cards", () => {
    let room = makeRoom(["Alice", "Bob", "Charlie"]);
    room = { ...room, cardsToWin: 5, status: "playing" };
    room = {
      ...room,
      players: room.players.map((p) =>
        p.id === room.players[0].id ? { ...p, cardsWon: 4 } : p,
      ),
    };
    expect(checkWinCondition(room)).toBe(false);
  });
});
