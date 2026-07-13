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

  return (
    <div className={`grid ${cols} gap-2`}>
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
            className={`relative rounded-lg p-2 text-center border transition-all duration-300 animate-slide-up ${
              isWinner
                ? "border-brand bg-brand/10 shadow-[0_0_6px_rgba(245,158,11,0.15)]"
                : hasVoted
                  ? "border-accent-success/30 bg-accent-success/5"
                  : "border-border bg-surface-raised"
            }`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {p.isHost && (
              <Crown size={10} className="absolute top-1 right-1 text-accent-warning" />
            )}

            {hasVoted && (
              <Check size={10} className="absolute top-1 left-1 text-accent-success" />
            )}

            {notVoted && (
              <Clock size={10} className="absolute top-1 left-1 text-text-muted" />
            )}

            <p className={`text-xs font-semibold truncate ${isMe ? "text-brand-light" : "text-text-primary"}`}>
              {p.name}{isMe ? " (voce)" : ""}
            </p>

            {!votesRevealed && p.id === myVoteTargetId && (
              <span className="inline-block mt-0.5 px-1.5 py-px rounded-full bg-brand/20 border border-brand/30 text-brand-light text-[9px] font-semibold">
                seu voto
              </span>
            )}

            <div className={`mt-1 mx-auto ${isWinner ? "animate-glow-pulse" : ""}`}>
              {p.cardsWon > 0 ? (
                <div className="flex items-center justify-center">
                  {Array.from({ length: Math.min(p.cardsWon, 5) }).map((_, ci) => {
                    const angle = CARD_ANGLES[ci % CARD_ANGLES.length];
                    const isLastCard = ci === p.cardsWon - 1;

                    return (
                      <div
                        key={ci}
                        className={`w-4 h-5 rounded-[3px] bg-surface-card transition-all duration-300 ${
                          isWinner
                            ? "border border-brand shadow-[0_0_4px_rgba(245,158,11,0.2)]"
                            : "border border-brand/40"
                        } ${isLastCard && wonThisRound ? "animate-bounce-in" : "animate-card-in"}`}
                        style={{
                          marginLeft: ci > 0 ? "-8px" : 0,
                          rotate: `${angle}deg`,
                          animationDelay: isLastCard && wonThisRound ? "200ms" : `${ci * 40}ms`,
                        }}
                      />
                    );
                  })}
                  {p.cardsWon > 5 && (
                    <span className="text-text-muted text-[9px] ml-1">+{p.cardsWon - 5}</span>
                  )}
                </div>
              ) : (
                <div className="h-6 border border-dashed border-border rounded flex items-center justify-center">
                  <span className="text-text-muted text-[9px]">0</span>
                </div>
              )}
            </div>

            {votesRevealed && (
              <p className={`mt-1 text-[11px] font-bold ${isWinner ? "text-brand-light" : "text-text-muted"}`}>
                {count > 0 ? `${count} ${count === 1 ? "voto" : "votos"}` : ""}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
