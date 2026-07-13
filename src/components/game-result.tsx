"use client";

import { useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { RotateCcw, PartyPopper } from "lucide-react";
import PoopIcon from "./poop-icon";
import RulesModal from "./rules-modal";

const CONFETTI_DOTS = [
  { color: "bg-brand",            top: -4,  left: 28,  delay: 0 },
  { color: "bg-accent-success",   top: 8,   right: -4,  delay: 0.25 },
  { color: "bg-accent-warning",   bottom: 20, right: 4, delay: 0.45 },
  { color: "bg-accent-danger",    bottom: -4, left: 24, delay: 0.65 },
  { color: "bg-brand-light",      top: 44,  left: -6,  delay: 0.85 },
  { color: "bg-brand-dark",       top: 28,  right: 22, delay: 1.05 },
];

export default function GameResult() {
  const { gameResult, room, myPlayerId } = useGameStore();

  const handlePlayAgain = useCallback(() => {
    getSocket().emit("game:playAgain", {});
  }, []);

  if (!gameResult || !room || !myPlayerId) return null;

  const hasVoted = room.playAgainVotes.includes(myPlayerId);
  const connectedPlayers = room.players.filter((p) => p.connected).length;
  const voteProgress = room.playAgainVotes.length;

  const tiePlayers = gameResult.players.filter(
    (p) => p.cardsWon === gameResult.players[0].cardsWon
  );

  return (
    <main className="min-h-dvh bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-10 animate-bounce-in">
        <div className="text-center space-y-5">
          <div className="relative mx-auto w-32 h-32">
            {CONFETTI_DOTS.map((d, i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 rounded-full ${d.color} animate-confetti-bob`}
                style={{
                  top: d.top !== undefined ? `${d.top}px` : undefined,
                  left: d.left !== undefined ? `${d.left}px` : undefined,
                  right: d.right !== undefined ? `${d.right}px` : undefined,
                  bottom: d.bottom !== undefined ? `${d.bottom}px` : undefined,
                  animationDelay: `${d.delay}s`,
                }}
              />
            ))}
            <div
              className={`absolute inset-0 w-32 h-32 rounded-full border-2 flex items-center justify-center animate-crown-entrance ${
                gameResult.isTie
                  ? "bg-surface-card border-accent-warning/30"
                  : "bg-surface-card border-brand/30"
              }`}
            >
              <PoopIcon
                size={64}
                className={gameResult.isTie ? "text-accent-warning" : "text-brand-light"}
              />
            </div>
          </div>

          {gameResult.isTie ? (
            <>
              <h2 className="text-4xl font-black text-accent-warning"
                style={{ textShadow: "0 0 24px rgba(234,179,8,0.4), 0 0 48px rgba(234,179,8,0.15)" }}>
                Empate!
              </h2>
              <div className="relative inline-block -rotate-2">
                <div className="bg-surface-card border border-accent-warning/20 rounded-xl px-5 py-2.5">
                  <p className="text-text-primary font-bold text-lg">
                    {tiePlayers.map((p) => p.name).join(" e ")}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-surface-card border border-border rounded-full px-4 py-2">
                <span className="text-text-secondary font-medium text-base">
                  {tiePlayers[0].cardsWon} cartas cada
                </span>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-black text-brand-light"
                style={{ textShadow: "0 0 24px rgba(245,158,11,0.45), 0 0 48px rgba(245,158,11,0.2)" }}>
                {gameResult.winner.name}
              </h2>
              <div className="relative inline-block -rotate-2">
                <div className="relative bg-accent-danger/10 border border-accent-danger/30 rounded-xl px-5 py-2.5">
                  <span className="absolute -top-1 -right-1">
                    <PartyPopper size={18} className="text-accent-warning" />
                  </span>
                  <p className="text-accent-danger font-bold text-lg">
                    é o(a) Amigo de M*!
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-surface-card border border-border rounded-full px-4 py-2">
                <span className="text-text-secondary font-medium text-base">
                  {gameResult.winner.cardsWon} cartas
                </span>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm text-text-muted font-medium px-1">Ranking</h3>
          {gameResult.players.map((p, i) => {
            const isWinner = p.id === gameResult.winner.id && !gameResult.isTie;
            const isFirst = i === 0;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all animate-slide-up ${
                  isWinner
                    ? "border-brand/30 bg-brand/5"
                    : isFirst
                      ? "border-accent-warning/20 bg-surface-raised"
                      : "border-border bg-surface-raised"
                }`}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                <span
                  className={`font-mono text-sm w-6 font-bold ${
                    isFirst ? "text-brand-light" : "text-text-muted"
                  }`}
                >
                  #{i + 1}
                </span>
                <span className="flex-1 font-semibold text-text-primary truncate">
                  {p.name}
                </span>
                <div className="flex items-end gap-px">
                  {Array.from({ length: Math.min(p.cardsWon, 10) }).map((_, j) => (
                    <div
                      key={j}
                      className={`w-2.5 h-5 rounded-sm border ${
                        isWinner
                          ? "bg-brand/80 border-brand/40"
                          : isFirst
                            ? "bg-accent-warning/50 border-accent-warning/30"
                            : "bg-surface-card border-border"
                      }`}
                    />
                  ))}
                  {p.cardsWon > 10 && (
                    <span className="text-xs text-text-muted font-bold ml-1 leading-5">
                      +{p.cardsWon - 10}
                    </span>
                  )}
                </div>
                <span
                  className={`font-bold text-sm min-w-[4rem] text-right ${
                    isWinner ? "text-brand-light" : "text-text-secondary"
                  }`}
                >
                  {p.cardsWon} cartas
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={handlePlayAgain}
          disabled={hasVoted}
          className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl font-bold text-lg transition-all duration-200 touch-target ${
            hasVoted
              ? "bg-surface-raised text-text-muted cursor-not-allowed border border-border"
              : "bg-gradient-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand active:scale-[0.98] text-black font-black shadow-2xl shadow-brand/30"
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
