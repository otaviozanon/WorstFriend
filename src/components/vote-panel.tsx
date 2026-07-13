"use client";

import { useState, useEffect } from "react";
import { Player } from "@/game-engine/types";
import { Check, UserCheck, ArrowRight } from "lucide-react";

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
    <div className="w-full max-w-lg mx-auto space-y-3">
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
            timeLeft <= 5
              ? "border-accent-danger bg-accent-danger/10 animate-pulse"
              : "border-brand bg-brand/5"
          }`}>
            <span className={`text-base font-black font-mono ${
              timeLeft <= 5 ? "text-accent-danger" : "text-brand-light"
            }`}>
              {timeLeft}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {players.filter(p => p.id !== myPlayerId).slice(0, 5).map((p, i) => {
              const v = votedPlayerIds.has(p.id);
              return (
                <div key={p.id} className={`w-5 h-5 rounded-full border-2 border-surface flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                  v ? "bg-accent-success text-surface scale-100" : "bg-surface-card text-text-muted scale-90"
                }`} style={{ zIndex: v ? 10 : 5 - i }}>
                  {v ? <Check size={10} strokeWidth={3} /> : "?"}
                </div>
              );
            })}
            {others.length > 5 && (
              <span className="text-text-muted text-[9px] self-center ml-1">+{others.length - 5}</span>
            )}
          </div>
          <span className="text-text-muted text-xs">
            {votedCount}/{others.length}
          </span>
        </div>
      </div>

      {hasVoted && myVoteTargetId && (
        <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs font-medium animate-slide-up">
          <UserCheck size={12} />
          Voce votou em <strong className="ml-1">{players.find(p => p.id === myVoteTargetId)?.name}</strong>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-1.5">
        {!hasVoted && others.length > 0 && (
          <p className="w-full text-text-muted text-[10px] text-center mb-1">Toque em um jogador para votar:</p>
        )}
        {others.map((p, i) => {
          const alreadyVoted = votedPlayerIds.has(p.id);
          const isMyVote = p.id === myVoteTargetId;
          const isLocalSelection = !hasVoted && p.id === localVote && !isMyVote;

          return (
            <button
              key={p.id}
              onClick={() => handleVote(p.id)}
              disabled={hasVoted}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 active:scale-95 ${
                isMyVote
                  ? "border-brand bg-brand/10 text-brand-light"
                  : isLocalSelection
                    ? "border-brand/60 bg-brand/5 text-brand-light animate-pulse"
                    : alreadyVoted
                      ? "border-accent-success/30 bg-accent-success/5 text-accent-success cursor-default"
                      : hasVoted
                        ? "border-border bg-surface-raised text-text-muted cursor-default"
                        : "border-border bg-surface-raised hover:border-brand/40 hover:bg-surface-card text-text-primary"
              }`}
            >
              {p.name}
              {isMyVote && <UserCheck size={12} />}
              {isLocalSelection && <ArrowRight size={12} className="animate-pulse" />}
              {alreadyVoted && !isMyVote && !isLocalSelection && <Check size={12} />}
            </button>
          );
        })}
      </div>

      {hasVoted && notVotedCount > 0 && (
        <p className="text-text-muted text-[10px] text-center">
          Aguardando mais {notVotedCount} {notVotedCount === 1 ? "jogador" : "jogadores"}...
        </p>
      )}
    </div>
  );
}
