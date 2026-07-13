"use client";

import { Player, Round } from "@/game-engine/types";
import { useEffect, useState } from "react";

interface Props {
  round: Round;
  players: Player[];
  voteCounts: Map<string, number>;
}

export default function VoteReveal({ round, players, voteCounts }: Props) {
  const [step, setStep] = useState(0);
  const votes = round.votes;

  useEffect(() => {
    if (step < votes.length) {
      const timer = setTimeout(() => setStep((s) => s + 1), 500);
      return () => clearTimeout(timer);
    }
  }, [step, votes.length]);

  const winner = round.winnerId
    ? players.find((p) => p.id === round.winnerId)
    : null;

  const getName = (id: string) => players.find((p) => p.id === id)?.name ?? "?";

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 animate-fade-in">
      <div className="space-y-2">
        {votes.map((v, i) => (
          <div
            key={v.playerId}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-raised border border-border transition-all duration-300 ${
              i < step ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-text-primary font-medium">{getName(v.playerId)}</span>
            <span className="text-text-muted text-xs">→</span>
            <span className="text-brand-light font-bold">
              {v.targetId ? getName(v.targetId) : "nao votou"}
            </span>
          </div>
        ))}
      </div>

      {step >= votes.length && (
        <div className={`text-center p-4 rounded-xl border-2 animate-bounce-in ${
          winner
            ? "border-brand/30 bg-brand/10"
            : "border-border bg-surface-raised"
        }`}>
          {winner ? (
            <p className="text-lg font-bold text-brand-light">
              {winner.name} ganhou a carta! ({voteCounts.get(winner.id)} votos)
            </p>
          ) : (
            <p className="text-lg font-bold text-text-muted">
              Empate! Ninguem ganhou a carta.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
