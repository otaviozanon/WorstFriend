"use client";

import { useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { Crown, RotateCcw } from "lucide-react";
import RulesModal from "./rules-modal";

export default function GameResult() {
  const { gameResult, room, myPlayerId } = useGameStore();

  const handlePlayAgain = useCallback(() => {
    getSocket().emit("game:playAgain", {});
  }, []);

  if (!gameResult || !room || !myPlayerId) return null;

  const hasVoted = room.playAgainVotes.includes(myPlayerId);
  const connectedPlayers = room.players.filter((p) => p.connected).length;
  const voteProgress = room.playAgainVotes.length;

  return (
    <main className="min-h-dvh bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-bounce-in">
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 rounded-full bg-brand/10 border-2 border-brand flex items-center justify-center animate-glow-pulse">
            <Crown size={48} className="text-brand-light" />
          </div>

          {gameResult.isTie ? (
            <>
              <h2 className="text-3xl font-black text-text-primary">Empate!</h2>
              <p className="text-text-secondary">
                {gameResult.players.filter((p) => p.cardsWon === gameResult.players[0].cardsWon)
                  .map((p) => p.name).join(" e ")} empataram com {gameResult.players[0].cardsWon} cartas cada.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-black text-brand-light">
                {gameResult.winner.name}
              </h2>
              <p className="text-text-secondary text-lg">
                e o <strong className="text-brand-light">Amigo de Merda</strong>!
              </p>
              <p className="text-text-muted text-sm">
                com {gameResult.winner.cardsWon} cartas
              </p>
            </>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm text-text-muted font-medium px-1">Ranking</h3>
          {gameResult.players.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl border transition-all ${
                p.id === gameResult.winner.id && !gameResult.isTie
                  ? "border-brand/30 bg-brand/10"
                  : "border-border bg-surface-raised"
              }`}
            >
              <span className="text-text-muted font-mono text-sm w-6">#{i + 1}</span>
              <span className="flex-1 font-medium text-text-primary">{p.name}</span>
              <span className="text-brand-light font-bold">{p.cardsWon} cartas</span>
            </div>
          ))}
        </div>

        <button
          onClick={handlePlayAgain}
          disabled={hasVoted}
          className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl font-bold text-lg transition-all duration-200 touch-target ${
            hasVoted
              ? "bg-surface-raised text-text-muted cursor-not-allowed border border-border"
              : "bg-accent-success text-white hover:bg-accent-success/90 active:scale-[0.98] shadow-lg shadow-accent-success/25"
          }`}
        >
          <RotateCcw size={22} />
          {hasVoted ? "Aguardando outros jogadores..." : "Jogar Novamente"}
        </button>

        {connectedPlayers > 0 && (
          <div className="text-center space-y-1">
            <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${(voteProgress / connectedPlayers) * 100}%` }}
              />
            </div>
            <p className="text-text-muted text-xs">
              {voteProgress}/{connectedPlayers} votaram
            </p>
          </div>
        )}
      </div>
      <RulesModal />
    </main>
  );
}
