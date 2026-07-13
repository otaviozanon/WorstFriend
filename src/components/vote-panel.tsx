"use client";

import { Player } from "@/game-engine/types";
import { Check, UserCheck } from "lucide-react";

interface Props {
  players: Player[];
  myPlayerId: string;
  hasVoted: boolean;
  onVote: (targetId: string) => void;
  timeLeft: number;
  votedPlayerIds: Set<string>;
  myVoteTargetId: string | null;
}

export default function VotePanel({ players, myPlayerId, hasVoted, onVote, timeLeft, votedPlayerIds, myVoteTargetId }: Props) {
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

      <div className="flex flex-col gap-2">
        {!hasVoted && (
          <p className="text-text-muted text-xs text-center">Escolha quem votar:</p>
        )}
        {others.map((p, i) => {
          const alreadyVoted = votedPlayerIds.has(p.id);
          const isMyVote = p.id === myVoteTargetId;

          return (
            <div
              key={p.id}
              onClick={() => !hasVoted && onVote(p.id)}
              className={`w-full px-5 py-4 rounded-xl border-2 font-medium text-lg transition-all duration-200 touch-target flex items-center justify-between ${
                isMyVote
                  ? "border-brand/50 bg-brand/10 text-brand-light shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : alreadyVoted
                    ? "border-accent-success/30 bg-accent-success/5 text-accent-success"
                    : hasVoted
                      ? "bg-surface-raised border-border text-text-muted"
                      : "bg-surface-raised border-border hover:border-brand/40 hover:bg-surface-card text-text-primary active:scale-[0.98] cursor-pointer"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span>{p.name}</span>
              {isMyVote && <UserCheck size={18} className="text-brand-light" />}
              {alreadyVoted && !isMyVote && <Check size={18} />}
            </div>
          );
        })}
      </div>

      {hasVoted && notVotedCount > 0 && (
        <p className="text-text-muted text-xs text-center">{notVotedCount} ainda nao votaram</p>
      )}
    </div>
  );
}
