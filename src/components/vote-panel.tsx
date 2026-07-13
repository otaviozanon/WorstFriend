"use client";

import { Player } from "@/game-engine/types";
import { Check } from "lucide-react";

interface Props {
  players: Player[];
  myPlayerId: string;
  hasVoted: boolean;
  onVote: (targetId: string) => void;
  timeLeft: number;
  votedPlayerIds: Set<string>;
  myVoteTargetName: string | null;
}

export default function VotePanel({ players, myPlayerId, hasVoted, onVote, timeLeft, votedPlayerIds, myVoteTargetName }: Props) {
  const others = players.filter((p) => p.id !== myPlayerId);
  const votedCount = votedPlayerIds.size;
  const notVotedCount = players.filter((p) => p.id !== myPlayerId && !votedPlayerIds.has(p.id)).length;

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-center gap-3">
        <div className={`text-3xl font-mono font-black transition-colors duration-300 ${
          timeLeft <= 3 ? "text-accent-danger animate-pulse" : "text-brand-light"
        }`}>
          {timeLeft}s
        </div>
        <span className="text-text-muted text-xs">
          {votedCount}/{players.length - 1} votaram
        </span>
      </div>

      {hasVoted ? (
        <div className="text-center py-4 space-y-2">
          <p className="text-text-secondary text-sm">
            Voce votou em <strong className="text-brand-light">{myVoteTargetName}</strong>
          </p>
          <p className="text-text-muted text-xs animate-pulse">Aguardando os outros...</p>
          {notVotedCount > 0 && (
            <p className="text-text-muted text-xs">{notVotedCount} ainda nao votaram</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-text-muted text-xs text-center">Escolha quem votar:</p>
          {others.map((p, i) => {
            const alreadyVoted = votedPlayerIds.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onVote(p.id)}
                className={`w-full px-5 py-4 rounded-xl border-2 font-medium text-lg transition-all duration-200 active:scale-[0.98] touch-target ${
                  alreadyVoted
                    ? "border-accent-success/30 bg-accent-success/5 text-accent-success"
                    : "bg-surface-raised border-border hover:border-brand/40 hover:bg-surface-card text-text-primary"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="flex items-center justify-between">
                  {p.name}
                  {alreadyVoted && <Check size={18} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
