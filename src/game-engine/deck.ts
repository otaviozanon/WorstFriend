import { Card } from "./types";
import { cards } from "@/cards/data";

export function shuffleDeck(): Card[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCard(deck: Card[], index: number): Card | undefined {
  return deck[index];
}
