import { describe, it, expect } from "vitest";
import { shuffleDeck, drawCard } from "@/game-engine/deck";
import { cards } from "@/cards/data";

describe("shuffleDeck", () => {
  it("returns an array with all 150 ácida_extrema cards by default", () => {
    const deck = shuffleDeck();
    expect(deck).toHaveLength(150);
  });

  it("contains all ácida_extrema card ids by default", () => {
    const deck = shuffleDeck();
    const ids = deck.map((c) => c.id).sort((a, b) => a - b);
    const defaultIds = cards.filter((c) => c.categories.includes("ácida_extrema")).map((c) => c.id).sort((a, b) => a - b);
    expect(ids).toEqual(defaultIds);
  });

  it("filters by multiple categories", () => {
    const deck = shuffleDeck(["ácida_extrema", "+18"]);
    const categoryIds = cards
      .filter((c) => c.categories.includes("ácida_extrema") || c.categories.includes("+18"))
      .map((c) => c.id)
      .sort((a, b) => a - b);
    const ids = deck.map((c) => c.id).sort((a, b) => a - b);
    expect(ids).toEqual(categoryIds);
  });

  it("filters by single category", () => {
    const deck = shuffleDeck(["+18"]);
    const ids = deck.map((c) => c.id).sort((a, b) => a - b);
    const adultIds = cards.filter((c) => c.categories.includes("+18")).map((c) => c.id).sort((a, b) => a - b);
    expect(ids).toEqual(adultIds);
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
