import { describe, it, expect } from "vitest";
import { buildGameResult } from "@/game-engine/scoring";
import { Player } from "@/game-engine/types";

function makePlayer(id: string, cardsWon: number): Player {
  return { id, name: id, cardsWon, connected: true, isHost: false };
}

describe("buildGameResult", () => {
  it("returns player with most cards as winner", () => {
    const players = [makePlayer("a", 2), makePlayer("b", 5), makePlayer("c", 1)];
    const result = buildGameResult(players);
    expect(result.winner.id).toBe("b");
    expect(result.isTie).toBe(false);
  });

  it("handles tie between top players", () => {
    const players = [makePlayer("a", 5), makePlayer("b", 5), makePlayer("c", 2)];
    const result = buildGameResult(players);
    expect(result.isTie).toBe(true);
  });

  it("sorts players by cardsWon descending", () => {
    const players = [makePlayer("a", 1), makePlayer("b", 3), makePlayer("c", 2)];
    const result = buildGameResult(players);
    expect(result.players[0].cardsWon).toBe(3);
    expect(result.players[1].cardsWon).toBe(2);
    expect(result.players[2].cardsWon).toBe(1);
  });
});
