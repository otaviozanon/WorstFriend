import { describe, it, expect } from "vitest";
import { startRound, recordVote, resolveRound } from "@/game-engine/round";
import { createRoom, joinRoom } from "@/game-engine/room";
import { Room } from "@/game-engine/types";

function makeRoom(players: string[]): Room {
  let room = createRoom(players[0]);
  for (let i = 1; i < players.length; i++) {
    room = joinRoom(room, players[i]);
  }
  return { ...room, status: "playing" };
}

describe("startRound", () => {
  it("draws the next card and sets room status to voting", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const updated = startRound(room);
    expect(updated.status).toBe("voting");
    expect(updated.rounds).toHaveLength(1);
    expect(updated.rounds[0].card).toBeDefined();
    expect(updated.rounds[0].votes).toEqual([]);
    expect(updated.rounds[0].votesRevealed).toBe(false);
    expect(updated.rounds[0].winnerId).toBeNull();
  });
});

describe("recordVote", () => {
  it("records a vote for a target player", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const voting = startRound(room);
    const voterId = voting.players[0].id;
    const targetId = voting.players[1].id;
    const updated = recordVote(voting, voterId, targetId);
    expect(updated.rounds[0].votes).toHaveLength(1);
    expect(updated.rounds[0].votes[0].playerId).toBe(voterId);
    expect(updated.rounds[0].votes[0].targetId).toBe(targetId);
  });

  it("throws if player votes for themselves", () => {
    const room = makeRoom(["Alice", "Bob"]);
    const voting = startRound(room);
    const voterId = voting.players[0].id;
    expect(() => recordVote(voting, voterId, voterId)).toThrow("Voce nao pode votar em si mesmo");
  });

  it("throws if player already voted", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    const voting = startRound(room);
    const [a, b, c] = voting.players;
    const withVote = recordVote(voting, a.id, b.id);
    expect(() => recordVote(withVote, a.id, c.id)).toThrow("Voce ja votou nesta rodada");
  });
});

describe("resolveRound", () => {
  it("returns winnerId for most voted player", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    let voting = startRound(room);
    const [a, b, c] = voting.players;
    voting = recordVote(voting, a.id, b.id);
    voting = recordVote(voting, b.id, a.id);
    voting = recordVote(voting, c.id, b.id);
    const result = resolveRound(voting);
    expect(result.winnerId).toBe(b.id);
  });

  it("returns null winnerId on tie", () => {
    const room = makeRoom(["Alice", "Bob", "Charlie"]);
    let voting = startRound(room);
    const [a, b, c] = voting.players;
    voting = recordVote(voting, a.id, b.id);
    voting = recordVote(voting, b.id, c.id);
    voting = recordVote(voting, c.id, a.id);
    const result = resolveRound(voting);
    expect(result.winnerId).toBeNull();
  });
});
