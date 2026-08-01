import { Card, CardCategory } from "./types";
import { cards } from "@/cards/data";

export function shuffleDeck(categories: CardCategory[] = ["ácida_extrema"]): Card[] {
  const categorySet = new Set(categories);
  const filtered = cards.filter((card) =>
    card.categories.some((c) => categorySet.has(c))
  );
  if (filtered.length === 0) {
    return [];
  }
  const deck = [...filtered];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCard(deck: Card[], index: number): Card | undefined {
  return deck[index];
}
