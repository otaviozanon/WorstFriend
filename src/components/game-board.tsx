"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { Round } from "@/game-engine/types";
import CardDisplay from "./card-display";
import PlayerGrid from "./player-grid";
import VotePanel from "./vote-panel";
import VoteReveal from "./vote-reveal";
import GameResult from "./game-result";
import RulesModal from "./rules-modal";

export default function GameBoard() {
  const { room, myPlayerId, gameResult } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(30);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundRef = useRef<number | null>(null);

  useEffect(() => {
    if (!room || !room.rounds.length) return;
    const currentRound = room.rounds[room.rounds.length - 1];

    if (room.status === "voting" && currentRound.roundNumber !== roundRef.current) {
      roundRef.current = currentRound.roundNumber;
      setTimeLeft(30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (room.status !== "voting") {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.status, room?.rounds.length]);

  const handleVote = useCallback((targetId: string) => {
    getSocket().emit("game:vote", { targetId });
  }, []);

  if (!room || !myPlayerId) return null;

  if (room.status === "finished" && gameResult) {
    return <GameResult />;
  }

  const currentRound = room.rounds[room.rounds.length - 1];
  const hasVoted = currentRound
    ? currentRound.votes.some((v) => v.playerId === myPlayerId)
    : false;

  const votedPlayerIds = new Set<string>();
  let myVoteTargetId: string | null = null;
  if (currentRound) {
    for (const v of currentRound.votes) {
      votedPlayerIds.add(v.playerId);
      if (v.playerId === myPlayerId && v.targetId) {
        myVoteTargetId = v.targetId;
      }
    }
  }

  const voteCounts = new Map<string, number>();
  if (currentRound) {
    for (const v of currentRound.votes) {
      if (v.targetId) {
        voteCounts.set(v.targetId, (voteCounts.get(v.targetId) || 0) + 1);
      }
    }
  }

  return (
    <main className="min-h-dvh bg-surface p-4">
      <div className="max-w-4xl mx-auto space-y-4 pt-3 pb-20">
        {currentRound && (
          <>
            <CardDisplay
              card={currentRound.card}
              roundNumber={currentRound.roundNumber}
              cardsToWin={room.cardsToWin}
            />

            {room.status === "voting" && (
              <VotePanel
                players={room.players}
                myPlayerId={myPlayerId}
                hasVoted={hasVoted}
                onVote={handleVote}
                timeLeft={timeLeft}
                myVoteTargetId={myVoteTargetId}
              />
            )}

            {room.status === "revealing" && (
              <VoteReveal
                round={currentRound}
                players={room.players}
                voteCounts={voteCounts}
              />
            )}

            <PlayerGrid
              players={room.players}
              myPlayerId={myPlayerId}
              winnerId={currentRound.winnerId}
              votesRevealed={room.status === "revealing" || room.status === "finished"}
              voteCounts={voteCounts}
              myVoteTargetId={myVoteTargetId}
              votedPlayerIds={votedPlayerIds}
              isVotingPhase={room.status === "voting"}
            />

            {room.status === "revealing" && myPlayerId === room.host && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => getSocket().emit("game:nextRound")}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand text-black font-bold text-lg transition-all duration-200 active:scale-[0.98] shadow-lg shadow-brand/30"
                >
                  Proxima Carta
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <RulesModal />
    </main>
  );
}
