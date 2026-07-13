"use client";

import { Player } from "@/game-engine/types";
import { Crown } from "lucide-react";

interface Props {
  players: Player[];
  myPlayerId: string;
  winnerId: string | null;
  votesRevealed: boolean;
  voteCounts: Map<string, number>;
}

const CARD_ANGLES = [-3, 0, 3];

export default function PlayerGrid({ players, myPlayerId, winnerId, votesRevealed, voteCounts }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {players.map((p, i) => {
        const count = votesRevealed ? (voteCounts.get(p.id) || 0) : 0;
        const isWinner = votesRevealed && p.id === winnerId;
        const isMe = p.id === myPlayerId;
        const wonThisRound = isWinner && p.cardsWon > 0;

        return (
          <div
            key={p.id}
            className={`relative rounded-xl p-4 text-center border-2 transition-all duration-500 animate-slide-up ${
              isWinner
                ? "border-brand bg-brand/10 shadow-lg shadow-brand/20"
                : "border-border bg-surface-raised"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {p.isHost && (
              <Crown size={12} className="absolute top-2 right-2 text-accent-warning" />
            )}

            <p className={`font-semibold truncate ${isMe ? "text-brand-light" : "text-text-primary"}`}>
              {p.name}{isMe ? " (voce)" : ""}
            </p>

            <div
              className={`mt-3 mx-auto rounded-lg p-1 ${
                isWinner ? "animate-glow-pulse" : ""
              }`}
            >
              {p.cardsWon > 0 ? (
                <div className="flex items-center justify-center">
                  {Array.from({ length: p.cardsWon }).map((_, ci) => {
                    const angle = CARD_ANGLES[ci % CARD_ANGLES.length];
                    const isLastCard = ci === p.cardsWon - 1;

                    return (
                      <div
                        key={ci}
                        className={`w-6 h-8 rounded-md bg-surface-card transition-all duration-300 ${
                          isWinner
                            ? "border border-brand shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                            : "border border-brand/40"
                        } ${isLastCard && wonThisRound ? "animate-bounce-in" : "animate-card-in"}`}
                        style={{
                          marginLeft: ci > 0 ? "-10px" : 0,
                          rotate: `${angle}deg`,
                          animationDelay: isLastCard && wonThisRound ? "250ms" : `${ci * 50}ms`,
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-10 border border-dashed border-border rounded-lg">
                  <span className="text-text-muted text-[10px] select-none">
                    sem cartas
                  </span>
                </div>
              )}
            </div>

            {votesRevealed && (
              <p
                className={`mt-2 text-sm font-bold ${
                  isWinner ? "text-brand-light" : "text-text-muted"
                }`}
              >
                {count} {count === 1 ? "voto" : "votos"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
