"use client";

import { Card } from "@/game-engine/types";

interface Props {
  card: Card;
  roundNumber: number;
  cardsToWin: number;
}

export default function CardDisplay({ card, roundNumber, cardsToWin }: Props) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-secondary text-xs font-medium">
          Rodada {roundNumber}
        </span>
        <span className="text-text-muted text-xs">
          {cardsToWin} cartas para vencer
        </span>
      </div>

      <div className="relative" style={{ perspective: "800px", minHeight: "100px" }}>
        <div
          className="absolute inset-0 rounded-2xl animate-card-back-out"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-full h-full rounded-2xl bg-surface-card border border-border flex items-center justify-center">
            <div className="grid grid-cols-3 gap-3 opacity-20">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-5 h-6 border border-brand/30 rounded-sm rotate-45" />
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl bg-surface-raised border border-border border-l-4 border-l-brand animate-card-front-in"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-brand shrink-0"
              >
                <path
                  d="M12 2L15 9H22L16 14L19 21L12 16L5 21L8 14L2 9H9L12 2Z"
                  fill="currentColor"
                />
              </svg>
              <div className="h-px flex-1 bg-gradient-to-r from-brand/40 to-transparent" />
              <span className="text-text-muted text-xs shrink-0">#{card.id}</span>
            </div>

            <p className="text-lg text-text-primary font-medium leading-relaxed text-balance">
              &ldquo;{card.text}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
