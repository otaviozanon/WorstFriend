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
    <div className="w-full max-w-lg mx-auto space-y-2">
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-0.5">
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
          <span className="text-text-muted text-[9px]">s</span>
        </div>
        <span className="text-text-muted text-xs">
          {votedCount}/{players.length - 1} votaram
        </span>
      </div>

      {hasVoted && myVoteTargetId && (
        <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/20 text-brand-light text-xs font-medium animate-slide-up">
          <UserCheck size={14} />
          Voto: <strong className="ml-0.5">{players.find(p => p.id === myVoteTargetId)?.name}</strong>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {!hasVoted && (
          <p className="text-text-muted text-[11px] text-center">Escolha:</p>
        )}
        {others.map((p, i) => {
          const alreadyVoted = votedPlayerIds.has(p.id);
          const isMyVote = p.id === myVoteTargetId;

          return (
            <div
              key={p.id}
              onClick={() => !hasVoted && onVote(p.id)}
              className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 touch-target flex items-center justify-between ${
                isMyVote
                  ? "border-brand/50 bg-brand/10 text-brand-light shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                  : alreadyVoted
                    ? "border-accent-success/30 bg-accent-success/5 text-accent-success"
                    : hasVoted
                      ? "bg-surface-raised border-border text-text-muted"
                      : "bg-surface-raised border-border hover:border-brand/40 hover:bg-surface-card text-text-primary active:scale-[0.98] cursor-pointer"
              }`}
            >
              <span className="truncate">{p.name}</span>
              {isMyVote && <UserCheck size={14} className="text-brand-light shrink-0" />}
              {alreadyVoted && !isMyVote && <Check size={14} className="shrink-0" />}
            </div>
          );
        })}
      </div>

      {hasVoted && notVotedCount > 0 && (
        <p className="text-text-muted text-[11px] text-center">{notVotedCount} ainda nao votaram</p>
      )}
    </div>
  );
}
