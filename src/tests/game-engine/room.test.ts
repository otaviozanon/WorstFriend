import { describe, it, expect } from "vitest";
import { createRoom, joinRoom, removePlayer, setPlayerDisconnected } from "@/game-engine/room";
import { Room } from "@/game-engine/types";

function makeWaitingRoom(): Room {
  return createRoom("Alice");
}

describe("createRoom", () => {
  it("creates a room with a 6-char code", () => {
    const room = createRoom("Alice");
    expect(room.code).toHaveLength(6);
    expect(room.code).toMatch(/^[A-Z0-9]+$/);
  });

  it("sets the creator as host and first player", () => {
    const room = createRoom("Alice");
    expect(room.players).toHaveLength(1);
    expect(room.players[0].name).toBe("Alice");
    expect(room.players[0].isHost).toBe(true);
    expect(room.players[0].connected).toBe(true);
    expect(room.host).toBe(room.players[0].id);
  });

  it("initializes with status waiting and shuffled deck", () => {
    const room = createRoom("Alice");
    expect(room.status).toBe("waiting");
    expect(room.deck).toHaveLength(150);
    expect(room.cardsToWin).toBe(5);
    expect(room.currentCardIndex).toBe(0);
    expect(room.rounds).toEqual([]);
    expect(room.timerSeconds).toBe(30);
  });
});

describe("joinRoom", () => {
  it("adds a player to the room", () => {
    const room = makeWaitingRoom();
    const updated = joinRoom(room, "Bob");
    expect(updated.players).toHaveLength(2);
    expect(updated.players[1].name).toBe("Bob");
    expect(updated.players[1].isHost).toBe(false);
  });

  it("throws if room status is not waiting", () => {
    const room = { ...makeWaitingRoom(), status: "playing" as const };
    expect(() => joinRoom(room, "Bob")).toThrow("Não é possível entrar em uma partida em andamento");
  });
});

describe("removePlayer", () => {
  it("removes a player and transfers host if needed", () => {
    const room = makeWaitingRoom();
    const withBob = joinRoom(room, "Bob");
    const hostId = withBob.host;
    const updated = removePlayer(withBob, hostId);
    expect(updated.players).toHaveLength(1);
    expect(updated.host).toBe(updated.players[0].id);
  });

  it("removes last player resulting in empty room", () => {
    const room = makeWaitingRoom();
    const hostId = room.players[0].id;
    const updated = removePlayer(room, hostId);
    expect(updated.players).toHaveLength(0);
  });
});

describe("setPlayerDisconnected", () => {
  it("marks a player as disconnected", () => {
    const room = makeWaitingRoom();
    const updated = setPlayerDisconnected(room, room.players[0].id);
    expect(updated.players[0].connected).toBe(false);
  });
});
