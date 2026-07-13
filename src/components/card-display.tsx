"use client";

import { Card } from "@/game-engine/types";

interface Props {
  card: Card;
  roundNumber: number;
  cardsToWin: number;
}

export default function CardDisplay({ card, roundNumber, cardsToWin }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="animate-deal-in mb-2 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-[10px] font-bold tracking-widest uppercase">
          Nova Carta
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-0.5 rounded-full bg-surface-card border border-border text-text-secondary text-[10px] font-medium">
          Rodada {roundNumber}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-surface-card border border-border text-text-muted text-[10px]">
          #{card.id}
        </span>
        <span className="text-text-muted text-[10px] font-medium">
          {cardsToWin} cartas
        </span>
      </div>

      <div className="relative" style={{ perspective: "800px", minHeight: "80px" }}>
        <div
          className="absolute inset-0 rounded-xl animate-card-back-out"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-full h-full rounded-xl bg-surface-card border border-border flex items-center justify-center">
            <div className="grid grid-cols-3 gap-2 opacity-20">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-4 h-5 border border-brand/30 rounded-sm rotate-45" />
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-xl bg-surface-raised border border-border border-l-4 border-l-brand animate-card-front-in"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="p-5">
            <p className="text-base text-text-primary font-medium leading-relaxed text-balance">
              &ldquo;{card.text}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
