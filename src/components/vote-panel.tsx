"use client";

import { useState, useEffect } from "react";
import { Player } from "@/game-engine/types";
import { Check } from "lucide-react";

interface Props {
  players: Player[];
  myPlayerId: string;
  hasVoted: boolean;
  onVote: (targetId: string) => void;
  timeLeft: number;
  myVoteTargetId: string | null;
}

export default function VotePanel({ players, myPlayerId, hasVoted, onVote, timeLeft, myVoteTargetId }: Props) {
  const others = players.filter((p) => p.id !== myPlayerId);
  const [localVote, setLocalVote] = useState<string | null>(null);

  useEffect(() => {
    if (myVoteTargetId) setLocalVote(myVoteTargetId);
  }, [myVoteTargetId]);

  const handleVote = (targetId: string) => {
    if (hasVoted) return;
    setLocalVote(targetId);
    onVote(targetId);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div className="flex justify-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
          timeLeft <= 5
            ? "border-accent-danger bg-accent-danger/10 animate-pulse"
            : "border-brand bg-brand/5"
        }`}>
          <span className={`text-lg font-black font-mono ${
            timeLeft <= 5 ? "text-accent-danger" : "text-brand-light"
          }`}>
            {timeLeft}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <p className="w-full text-text-muted text-xs text-center mb-1">Toque em um jogador para votar:</p>
        {others.map((p, i) => {
          const isMyVote = p.id === myVoteTargetId;
          const isLocalSelection = !hasVoted && p.id === localVote && !isMyVote;

          return (
            <button
              key={p.id}
              onClick={() => handleVote(p.id)}
              disabled={hasVoted}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 active:scale-95 ${
                isMyVote
                  ? "border-brand bg-brand/10 text-brand-light"
                  : isLocalSelection
                    ? "border-brand/60 bg-brand/5 text-brand-light animate-pulse"
                    : hasVoted
                      ? "border-border bg-surface-raised text-text-muted cursor-default"
                      : "border-border bg-surface-raised hover:border-brand/40 hover:bg-surface-card text-text-primary"
              }`}
            >
              {isMyVote && <Check size={14} />}
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
