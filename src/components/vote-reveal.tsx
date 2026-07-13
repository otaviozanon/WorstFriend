"use client";

import { Player, Round } from "@/game-engine/types";
import { Award, Meh } from "lucide-react";
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
      const timer = setTimeout(() => setStep((s) => s + 1), 200);
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

  const getInitial = (id: string) => playerInfo.get(id)?.initial ?? "?";
  const getColor = (id: string) => playerInfo.get(id)?.color ?? AVATAR_COLORS[0];
  const getName = (id: string) => playerInfo.get(id)?.name ?? "?";

  return (
    <div className="w-full max-w-lg mx-auto space-y-2 animate-fade-in">
      <p className="text-text-muted text-[10px] text-center">Votos:</p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {votes.map((v, i) => {
          const visible = i < step;
          return (
            <div
              key={v.playerId}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-raised border border-border text-xs transition-all duration-300 ${
                visible ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
            >
              <span className="text-text-primary font-medium text-xs">{getName(v.playerId)}</span>
              <span className="text-text-muted text-[10px]">→</span>
              {v.targetId ? (
                <span className="text-brand-light font-bold text-xs">{getName(v.targetId)}</span>
              ) : (
                <span className="text-text-muted text-[10px] italic">x</span>
              )}
            </div>
          );
        })}
      </div>

      {step >= votes.length && (
        <div className="animate-drum-roll">
          {winner ? (
            <div className="text-center p-3 rounded-xl border border-brand/30 bg-brand/5">
              <Award className="w-5 h-5 text-brand-light mx-auto mb-0.5" />
              <p className="text-sm font-extrabold text-brand-light">GANHOU A CARTA!</p>
              <p className="text-xs font-bold text-text-primary mt-0.5">{winner.name}</p>
              <p className="text-[10px] text-text-muted">{voteCounts.get(winner.id)} votos</p>
            </div>
          ) : (
            <div className="text-center p-3 rounded-xl border border-border bg-surface-raised">
              <Meh className="w-4 h-4 text-text-muted mx-auto mb-0.5" />
              <p className="text-xs font-bold text-text-muted">Empate!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
