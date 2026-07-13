import { Room, Round, Vote } from "./types";

export function startRound(room: Room): Room {
  const card = room.deck[room.currentCardIndex];
  const round: Round = {
    roundNumber: room.rounds.length + 1,
    card,
    votes: [],
    votesRevealed: false,
    winnerId: null,
  };
  return {
    ...room,
    status: "voting",
    rounds: [...room.rounds, round],
  };
}

export function recordVote(room: Room, playerId: string, targetId: string): Room {
  if (playerId === targetId) {
    throw new Error("Você não pode votar em si mesmo");
  }
  const currentRound = room.rounds[room.rounds.length - 1];
  if (!currentRound) {
    throw new Error("Nenhuma rodada ativa");
  }
  const alreadyVoted = currentRound.votes.find((v) => v.playerId === playerId);
  if (alreadyVoted) {
    throw new Error("Você já votou nesta rodada");
  }
  const vote: Vote = { playerId, targetId };
  return {
    ...room,
    rounds: [
      ...room.rounds.slice(0, -1),
      { ...currentRound, votes: [...currentRound.votes, vote] },
    ],
  };
}

export function allVotesIn(room: Room): boolean {
  const currentRound = room.rounds[room.rounds.length - 1];
  if (!currentRound) return false;
  return currentRound.votes.length >= room.players.length;
}

export function resolveRound(room: Room): Room {
  const currentRound = room.rounds[room.rounds.length - 1];
  if (!currentRound) return room;

  const voteCounts = new Map<string, number>();
  for (const vote of currentRound.votes) {
    if (vote.targetId) {
      voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
    }
  }

  let maxVotes = 0;
  let winnerId: string | null = null;
  let isTie = false;

  for (const [playerId, count] of voteCounts) {
    if (count > maxVotes) {
      maxVotes = count;
      winnerId = playerId;
      isTie = false;
    } else if (count === maxVotes) {
      isTie = true;
    }
  }

  if (isTie) {
    winnerId = null;
  }

  const updatedPlayers = winnerId
    ? room.players.map((p) =>
        p.id === winnerId ? { ...p, cardsWon: p.cardsWon + 1 } : p,
      )
    : room.players;

  return {
    ...room,
    winnerId,
    players: updatedPlayers,
    currentCardIndex: room.currentCardIndex + 1,
    status: "revealing",
    rounds: [
      ...room.rounds.slice(0, -1),
      { ...currentRound, votesRevealed: true, winnerId },
    ],
  };
}
