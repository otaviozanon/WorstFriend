"use client";

import { Card, Round } from "@/game-engine/types";

interface Props {
  card: Card;
  roundNumber: number;
  cardsToWin: number;
}

export default function CardDisplay({ card, roundNumber, cardsToWin }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto animate-card-in">
      <div className="flex items-center justify-between mb-3">
        <span className="px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs font-bold">
          Rodada {roundNumber}
        </span>
        <span className="text-text-muted text-xs font-medium">
          Primeiro a {cardsToWin} cartas vence
        </span>
      </div>

      <div className="p-6 rounded-2xl bg-surface-raised border border-border border-l-4 border-l-brand">
        <p className="text-lg text-text-primary font-medium leading-relaxed text-balance">
          &ldquo;{card.text}&rdquo;
        </p>
      </div>
    </div>
  );
}
