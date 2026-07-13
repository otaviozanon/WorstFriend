import { describe, it, expect } from "vitest";
import { shuffleDeck, drawCard } from "@/game-engine/deck";
import { cards } from "@/cards/data";

describe("shuffleDeck", () => {
  it("returns an array with all 84 cards", () => {
    const deck = shuffleDeck();
    expect(deck).toHaveLength(150);
  });

  it("contains all card ids", () => {
    const deck = shuffleDeck();
    const ids = deck.map((c) => c.id).sort((a, b) => a - b);
    expect(ids).toEqual(cards.map((c) => c.id).sort((a, b) => a - b));
  });

  it("does not mutate the original cards array", () => {
    const snapshot = [...cards];
    shuffleDeck();
    expect(cards).toEqual(snapshot);
  });
});

describe("drawCard", () => {
  it("returns the card at the given index", () => {
    const deck = cards;
    const card = drawCard(deck, 0);
    expect(card).toBeDefined();
    expect(card!.id).toBe(deck[0].id);
  });

  it("returns undefined for out-of-bounds index", () => {
    expect(drawCard(cards, 999)).toBeUndefined();
  });
});
