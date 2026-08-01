"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { Copy, Play, Users, Crown, WifiOff } from "lucide-react";
import RulesModal from "@/components/rules-modal";
import LanguageSwitcher from "@/components/language-switcher";
import { useLanguage } from "@/lib/i18n/useLanguage";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const { room, myPlayerId } = useGameStore();
  const { t } = useLanguage();

  useEffect(() => {
    if (!room) {
      router.push("/");
      return;
    }
  }, [room, router]);

  useEffect(() => {
    const socket = getSocket();
    function onGameUpdate(
      updated: ReturnType<typeof useGameStore.getState>["room"],
    ) {
      if (!updated) return;
      if (updated.status !== "waiting") router.push(`/jogo/${params.id}`);
    }
    socket.on("room:state", onGameUpdate);
    return () => {
      socket.off("room:state", onGameUpdate);
    };
  }, [params.id, router]);

  if (!room) return null;

  const isHost = myPlayerId === room.host;
  const canStart = room.players.length >= 3;
  const handleStart = useCallback(() => {
    if (!canStart) return;
    getSocket().emit("game:start");
  }, [canStart]);
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(room.code).catch(() => {
      alert(t.lobby.copyFailed);
    });
  }, [room.code, t]);
  const handleCopyLink = useCallback(() => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        const btn = document.getElementById("copy-link-btn");
        if (btn) {
          const orig = btn.textContent;
          btn.textContent = t.lobby.copied;
          setTimeout(() => { btn.textContent = orig; }, 2000);
        }
      })
      .catch(() => {
        alert(t.lobby.copyFailed);
      });
  }, [t]);

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md space-y-8 animate-scale-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-glow flex items-center justify-center">
            <Users size={32} className="text-brand-light" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t.lobby.title}
          </h1>
          <p className="text-text-muted text-sm">
            {room.cardsToWin} {t.home.cards} {t.lobby.cardsToWin.toLowerCase()}
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-center p-4 rounded-xl bg-surface-raised border border-border">
            <p className="text-text-muted text-sm mb-2">{t.lobby.roomCode}</p>
            <button
              onClick={handleCopyCode}
              className="group flex items-center justify-center gap-3 mx-auto text-3xl font-mono font-bold text-brand-light hover:text-brand tracking-[0.3em] transition-all duration-200 touch-target"
            >
              {room.code}
              <Copy size={18} />
            </button>
            <p className="text-text-muted text-xs mt-2">{t.lobby.copyCode}</p>
          </div>

          <div className="text-center p-4 rounded-xl bg-surface-raised border border-border">
            <button
              onClick={handleCopyLink}
              className="w-full text-center text-sm text-text-secondary hover:text-brand-light transition-colors"
            >
              <Copy size={14} className="inline mr-1" />
              {t.lobby.copyLink}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-text-secondary flex items-center gap-2">
              <Users size={16} />
              {t.lobby.players}
            </span>
            <span className="text-sm font-mono text-text-muted">
              {room.players.length}
            </span>
          </div>
          <div className="space-y-2">
            {room.players.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-5 py-4 rounded-xl bg-surface-raised border border-border animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className={`shrink-0 w-3 h-3 rounded-full transition-colors ${p.connected ? "bg-accent-success shadow-[0_0_6px_rgba(34,197,94,0.4)]" : "bg-accent-warning"}`}
                />
                <span className="flex-1 text-text-primary font-medium truncate">
                  {p.name}
                  {p.id === myPlayerId ? (
                    <span className="text-text-muted ml-2 text-sm">
                      {t.lobby.you}
                    </span>
                  ) : null}
                </span>
                {p.id === room.host ? (
                  <span className="flex items-center gap-1 text-accent-warning text-xs font-semibold">
                    <Crown size={14} />
                    {t.lobby.host}
                  </span>
                ) : null}
                {!p.connected ? (
                  <WifiOff size={14} className="text-accent-warning shrink-0" />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 touch-target ${
              canStart
                ? "bg-accent-success text-white hover:bg-accent-success/90 active:scale-[0.98] shadow-lg shadow-accent-success/25"
                : "bg-surface-raised text-text-muted cursor-not-allowed border border-border"
            }`}
          >
            <Play size={22} />
            {canStart ? t.lobby.startGame : t.lobby.waitingPlayers}
          </button>
        ) : (
          <div className="text-center py-6">
            <p className="text-text-muted text-sm animate-pulse">
              {t.lobby.waitingHost}
            </p>
          </div>
        )}
        <LanguageSwitcher />
        <RulesModal />
      </div>
    </main>
  );
}
