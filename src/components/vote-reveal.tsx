"use client";

import { Player, Round } from "@/game-engine/types";
import { ArrowRight, Award, Meh } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  round: Round;
  players: Player[];
  voteCounts: Map<string, number>;
}

const AVATAR_COLORS = [
  "bg-amber-500 text-surface",
  "bg-violet-500 text-white",
  "bg-emerald-500 text-surface",
  "bg-sky-500 text-surface",
  "bg-rose-500 text-white",
  "bg-teal-500 text-surface",
];

export default function VoteReveal({ round, players, voteCounts }: Props) {
  const [step, setStep] = useState(0);
  const votes = round.votes;

  useEffect(() => {
    if (step < votes.length) {
      const timer = setTimeout(() => setStep((s) => s + 1), 400);
      return () => clearTimeout(timer);
    }
  }, [step, votes.length]);

  const winner = round.winnerId
    ? players.find((p) => p.id === round.winnerId)
    : null;

  const getName = (id: string) => players.find((p) => p.id === id)?.name ?? "?";
  const getInitial = (id: string) => getName(id).charAt(0).toUpperCase();
  const getColor = (id: string) => {
    const idx = [...players].sort((a, b) => a.id.localeCompare(b.id)).findIndex((p) => p.id === id);
    return AVATAR_COLORS[Math.abs(idx) % AVATAR_COLORS.length];
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 animate-fade-in">
      <div className="space-y-2">
        {votes.map((v, i) => {
          const visible = i < step;
          return (
            <div
              key={v.playerId}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-raised border border-border overflow-hidden"
            >
              <div
                className={`flex items-center gap-3 transition-all duration-300 ${
                  visible
                    ? "opacity-100 translate-x-0 animate-slide-left-bounce"
                    : "opacity-0 -translate-x-8"
                }`}
                style={{ animationDelay: visible ? `${i * 0}ms` : undefined }}
              >
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${getColor(v.playerId)}`}
                >
                  {getInitial(v.playerId)}
                </span>
                <span className="text-text-primary font-medium">
                  {getName(v.playerId)}
                </span>
                <ArrowRight className="w-4 h-4 text-text-muted shrink-0" />
                {v.targetId ? (
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${getColor(v.targetId)}`}
                  >
                    {getInitial(v.targetId)}
                  </span>
                ) : null}
                <span className={v.targetId ? "text-brand-light font-bold" : "text-text-muted italic text-sm"}>
                  {v.targetId ? getName(v.targetId) : "nao votou"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {step >= votes.length && (
        <div className="animate-drum-roll">
          {winner ? (
            <div
              className="text-center p-6 rounded-2xl border-2 border-brand/40 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(217,119,6,0.08) 50%, rgba(245,158,11,0.12) 100%)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-brand/5 to-transparent" />
              <div className="relative z-10 space-y-3">
                <Award className="w-10 h-10 text-brand-light mx-auto" />
                <p className="text-2xl font-extrabold text-brand-light tracking-tight">
                  GANHOU A CARTA!
                </p>
                <p className="text-lg font-bold text-text-primary">
                  {winner.name}
                </p>
                <p className="text-sm text-text-muted">
                  {voteCounts.get(winner.id)} votos
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 rounded-2xl border-2 border-border bg-surface-raised">
              <Meh className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-lg font-bold text-text-muted">
                Empate! Ninguem ganhou a carta.
              </p>
              <p className="text-sm text-text-muted mt-1">
                Os votos foram divididos igualmente
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
