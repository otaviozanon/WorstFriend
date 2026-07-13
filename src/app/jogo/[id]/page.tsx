"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameStore } from "@/lib/store";
import GameBoard from "@/components/game-board";

export default function GamePage() {
  const router = useRouter();
  const { room } = useGameStore();

  useEffect(() => {
    if (!room) { router.push("/"); return; }
  }, [room, router]);

  if (!room) return null;

  return <GameBoard />;
}
