export interface Card {
  id: number;
  text: string;
}

export interface Player {
  id: string;
  name: string;
  cardsWon: number;
  connected: boolean;
  isHost: boolean;
}

export interface Vote {
  playerId: string;
  targetId: string | null;
}

export interface Round {
  roundNumber: number;
  card: Card;
  votes: Vote[];
  votesRevealed: boolean;
  winnerId: string | null;
}

export type RoomStatus = "waiting" | "voting" | "revealing" | "finished";

export interface Room {
  code: string;
  host: string;
  players: Player[];
  status: RoomStatus;
  cardsToWin: number;
  deck: Card[];
  currentCardIndex: number;
  rounds: Round[];
  timerSeconds: number;
  winnerId: string | null;
  playAgainVotes: string[];
}

export interface GameResult {
  players: Player[];
  winner: Player;
  isTie: boolean;
}
