export type CardCategory = "ácida_extrema" | "+18";

export interface Card {
  id: number;
  text: string;
  categories: CardCategory[];
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

export type RoomStatus = "waiting" | "playing" | "voting" | "revealing" | "finished";

export interface Room {
  code: string;
  host: string;
  players: Player[];
  status: RoomStatus;
  cardsToWin: number;
  categories: CardCategory[];
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

export type GameErrorCode =
  | "SELF_VOTE"
  | "NO_ACTIVE_ROUND"
  | "ALREADY_VOTED"
  | "INVALID_TARGET"
  | "DUPLICATE_NAME"
  | "ROOM_FULL"
  | "GAME_IN_PROGRESS"
  | "EMPTY_DECK"
  | "MIN_PLAYERS";

export const GAME_ERROR_MESSAGES: Record<GameErrorCode, string> = {
  SELF_VOTE: "Você não pode votar em si mesmo",
  NO_ACTIVE_ROUND: "Nenhuma rodada ativa",
  ALREADY_VOTED: "Você já votou nesta rodada",
  INVALID_TARGET: "Jogador alvo inválido",
  DUPLICATE_NAME: "Já existe um jogador com este nome",
  ROOM_FULL: "A sala está cheia",
  GAME_IN_PROGRESS: "Não é possível entrar em uma partida em andamento",
  EMPTY_DECK: "Nenhuma carta disponível para as categorias selecionadas",
  MIN_PLAYERS: "Mínimo de 3 jogadores",
};

export class GameError extends Error {
  constructor(public code: GameErrorCode) {
    super(GAME_ERROR_MESSAGES[code]);
    this.name = "GameError";
  }
}

export const MAX_PLAYERS = 12;
