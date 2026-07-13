"use client";

import { Player } from "@/game-engine/types";
import { Crown, Check, Clock } from "lucide-react";

interface Props {
  players: Player[];
  myPlayerId: string;
  winnerId: string | null;
  votesRevealed: boolean;
  voteCounts: Map<string, number>;
  myVoteTargetId?: string | null;
  votedPlayerIds?: Set<string>;
  isVotingPhase?: boolean;
}

const CARD_ANGLES = [-3, 0, 3];

export default function PlayerGrid({ players, myPlayerId, winnerId, votesRevealed, voteCounts, myVoteTargetId, votedPlayerIds, isVotingPhase }: Props) {
  const cols = players.length <= 6 ? "grid-cols-2 sm:grid-cols-3" : players.length <= 12 ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-4 sm:grid-cols-5";
  const votedCount = isVotingPhase && votedPlayerIds ? votedPlayerIds.size : 0;

  return (
    <div className="space-y-3">
      {isVotingPhase && (
        <div className="flex items-center justify-center gap-2">
          <div className="flex -space-x-1">
            {players.slice(0, 7).map((p, i) => {
              const v = votedPlayerIds?.has(p.id);
              return (
                <div key={p.id} className={`w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  v ? "bg-accent-success text-surface scale-100" : "bg-surface-card text-text-muted scale-90"
                }`} style={{ zIndex: v ? 10 : 5 - i }}>
                  {v ? <Check size={11} strokeWidth={3} /> : "?"}
                </div>
              );
            })}
            {players.length > 7 && (
              <span className="text-text-muted text-[10px] self-center ml-1">+{players.length - 7}</span>
            )}
          </div>
          <span className="text-text-muted text-xs">{votedCount}/{players.length}</span>
        </div>
      )}

      <div className={`grid ${cols} gap-2.5`}>
      {players.map((p, i) => {
        const count = votesRevealed ? (voteCounts.get(p.id) || 0) : 0;
        const isWinner = votesRevealed && p.id === winnerId;
        const isMe = p.id === myPlayerId;
        const wonThisRound = isWinner && p.cardsWon > 0;
        const hasVoted = isVotingPhase && votedPlayerIds ? votedPlayerIds.has(p.id) : false;
        const notVoted = isVotingPhase && !hasVoted && p.id !== myPlayerId;

        return (
          <div
            key={p.id}
            className={`relative rounded-xl p-3 text-center border transition-all duration-300 animate-slide-up ${
              isWinner
                ? "border-brand/50 bg-brand/5"
                : hasVoted
                  ? "border-accent-success/30 bg-accent-success/5"
                  : "border-border bg-surface-raised"
            }`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {p.isHost && (
              <Crown size={12} className="absolute top-1.5 right-1.5 text-accent-warning" />
            )}

            {hasVoted && (
              <Check size={12} className="absolute top-1.5 left-1.5 text-accent-success" />
            )}

            {notVoted && (
              <Clock size={12} className="absolute top-1.5 left-1.5 text-text-muted" />
            )}

            <p className={`text-sm font-semibold truncate ${isMe ? "text-brand-light" : "text-text-primary"}`}>
              {p.name}{isMe ? " (você)" : ""}
            </p>

            {!votesRevealed && p.id === myVoteTargetId && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-brand/20 border border-brand/30 text-brand-light text-[10px] font-semibold">
                seu voto
              </span>
            )}

            <div className="mt-1.5 mx-auto">
              {p.cardsWon > 0 ? (
                <div className="flex items-center justify-center">
                  {Array.from({ length: Math.min(p.cardsWon, 7) }).map((_, ci) => {
                    const angle = CARD_ANGLES[ci % CARD_ANGLES.length];
                    const isLastCard = ci === p.cardsWon - 1;

                    return (
                      <div
                        key={ci}
                        className={`w-5 h-7 rounded-[3px] bg-surface-card transition-all duration-300 border border-brand/40 ${
                          isLastCard && wonThisRound ? "animate-bounce-in" : "animate-card-in"}
                        }`}
                        style={{
                          marginLeft: ci > 0 ? "-10px" : 0,
                          rotate: `${angle}deg`,
                          animationDelay: isLastCard && wonThisRound ? "200ms" : `${ci * 40}ms`,
                        }}
                      />
                    );
                  })}
                  {p.cardsWon > 7 && (
                    <span className="text-text-muted text-[10px] ml-1">+{p.cardsWon - 7}</span>
                  )}
                </div>
              ) : (
                <div className="h-8 border border-dashed border-border rounded flex items-center justify-center">
                  <span className="text-text-muted text-[10px]">0</span>
                </div>
              )}
            </div>

            {votesRevealed && (
              <p className={`mt-1.5 text-xs font-bold ${isWinner ? "text-brand-light" : "text-text-muted"}`}>
                {count > 0 ? `${count} ${count === 1 ? "voto" : "votos"}` : ""}
              </p>
            )}
          </div>
        );
      })}
    </div>
    </div>
  );
}
