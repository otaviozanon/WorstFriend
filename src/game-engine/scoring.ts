import { Player, GameResult } from "./types";

export function buildGameResult(players: Player[]): GameResult {
  const sorted = [...players].sort((a, b) => b.cardsWon - a.cardsWon);
  const maxCards = sorted[0]?.cardsWon ?? 0;
  const topPlayers = sorted.filter((p) => p.cardsWon === maxCards);
  return {
    players: sorted,
    winner: sorted[0],
    isTie: topPlayers.length > 1,
  };
}
