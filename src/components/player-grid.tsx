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

export default function PlayerGrid({ players, myPlayerId, winnerId, votesRevealed, voteCounts }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {players.map((p, i) => {
        const count = votesRevealed ? (voteCounts.get(p.id) || 0) : 0;
        const isWinner = votesRevealed && p.id === winnerId;
        const isMe = p.id === myPlayerId;

        return (
          <div
            key={p.id}
            className={`relative rounded-xl p-4 text-center border-2 transition-all duration-300 animate-slide-up ${
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
            <div className="mt-2 flex items-center justify-center gap-1">
              {Array.from({ length: p.cardsWon }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-sm bg-brand" />
              ))}
            </div>
            {votesRevealed && (
              <p className={`mt-1 text-sm font-bold ${isWinner ? "text-brand-light" : "text-text-muted"}`}>
                {count} {count === 1 ? "voto" : "votos"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
