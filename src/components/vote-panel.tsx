"use client";

import { Player } from "@/game-engine/types";

interface Props {
  players: Player[];
  myPlayerId: string;
  hasVoted: boolean;
  onVote: (targetId: string) => void;
  timeLeft: number;
}

export default function VotePanel({ players, myPlayerId, hasVoted, onVote, timeLeft }: Props) {
  const others = players.filter((p) => p.id !== myPlayerId);

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-center gap-3">
        <div className={`text-3xl font-mono font-black transition-colors duration-300 ${
          timeLeft <= 1 ? "text-accent-danger animate-pulse" : "text-brand-light"
        }`}>
          {timeLeft}s
        </div>
      </div>

      {hasVoted ? (
        <div className="text-center py-4">
          <p className="text-text-secondary text-sm animate-pulse">Voto registrado! Aguardando os outros...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-text-muted text-xs text-center">Escolha quem votar:</p>
          {others.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onVote(p.id)}
              className="w-full px-5 py-4 rounded-xl bg-surface-raised border-2 border-border
                         hover:border-brand/40 hover:bg-surface-card text-text-primary
                         font-medium text-lg transition-all duration-200 active:scale-[0.98] touch-target"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
