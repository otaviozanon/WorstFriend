"use client";

import { Player, Round } from "@/game-engine/types";
import { ArrowRight, Award, Meh } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
      const timer = setTimeout(() => setStep((s) => s + 1), 250);
      return () => clearTimeout(timer);
    }
  }, [step, votes.length]);

  const winner = round.winnerId
    ? players.find((p) => p.id === round.winnerId)
    : null;

  const playerInfo = useMemo(() => {
    const map = new Map<string, { name: string; initial: string; color: string }>();
    const sorted = [...players].sort((a, b) => a.id.localeCompare(b.id));
    sorted.forEach((p, idx) => {
      map.set(p.id, {
        name: p.name,
        initial: p.name.charAt(0).toUpperCase(),
        color: AVATAR_COLORS[Math.abs(idx) % AVATAR_COLORS.length],
      });
    });
    return map;
  }, [players]);

  const getName = (id: string) => playerInfo.get(id)?.name ?? "?";
  const getInitial = (id: string) => playerInfo.get(id)?.initial ?? "?";
  const getColor = (id: string) => playerInfo.get(id)?.color ?? AVATAR_COLORS[0];

  return (
    <div className="w-full max-w-lg mx-auto space-y-2 animate-fade-in">
      <div className="space-y-1">
        {votes.map((v, i) => {
          const visible = i < step;
          return (
            <div
              key={v.playerId}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-raised border border-border overflow-hidden"
            >
              <div
                className={`flex items-center gap-2 transition-all duration-300 ${
                  visible
                    ? "opacity-100 translate-x-0 animate-slide-left-bounce"
                    : "opacity-0 -translate-x-8"
                }`}
                style={{ animationDelay: visible ? `${i * 0}ms` : undefined }}
              >
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${getColor(v.playerId)}`}>
                  {getInitial(v.playerId)}
                </span>
                <span className="text-text-primary text-xs font-medium">{getName(v.playerId)}</span>
                <ArrowRight className="w-3 h-3 text-text-muted shrink-0" />
                {v.targetId ? (
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${getColor(v.targetId)}`}>
                    {getInitial(v.targetId)}
                  </span>
                ) : null}
                <span className={v.targetId ? "text-brand-light text-xs font-bold" : "text-text-muted italic text-xs"}>
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
            <div className="text-center p-4 rounded-xl border border-brand/30 bg-brand/5">
              <Award className="w-6 h-6 text-brand-light mx-auto mb-1" />
              <p className="text-lg font-extrabold text-brand-light">GANHOU A CARTA!</p>
              <p className="text-sm font-bold text-text-primary mt-1">{winner.name}</p>
              <p className="text-xs text-text-muted">{voteCounts.get(winner.id)} votos</p>
            </div>
          ) : (
            <div className="text-center p-4 rounded-xl border border-border bg-surface-raised">
              <Meh className="w-5 h-5 text-text-muted mx-auto mb-1" />
              <p className="text-sm font-bold text-text-muted">Empate! Ninguem ganhou.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
