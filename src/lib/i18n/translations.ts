export const translations = {
  pt: {
    // Home page
    home: {
      title: "Amigos de M*",
      subtitle: "WorstFriend",
      description: "Jogo de votacao • 3+ jogadores",
      namePlaceholder: "Seu nome",
      cards: "cartas",
      createRoom: "Criar Sala",
      orJoin: "ou entre em uma sala",
      roomCodeLabel: "CODIGO",
      roomCodePlaceholder: "Digite o codigo da sala",
      joinRoom: "Entrar na Sala",
      errorName: "Digite seu nome",
      errorCode: "Digite o código da sala",
    },
    // Lobby
    lobby: {
      title: "Sala de Espera",
      roomCode: "Codigo da sala",
      copyCode: "Clique para copiar",
      copyLink: "Copiar link da sala",
      players: "Jogadores",
      you: "(voce)",
      host: "HOST",
      cardsToWin: "Cartas para vencer",
      startGame: "Iniciar Partida",
      waitingPlayers: "Aguardando jogadores...",
      waitingHost: "Aguardando o host iniciar a partida...",
    },
    // Game Result
    result: {
      tie: "Empate!",
      tieDesc: "Multiplos Amigos de M*!",
      winner: "venceu!",
      winnerTitle: "é o(a) Amigo(a) de M* oficial!",
      ranking: "Ranking Final",
      cards: "cartas",
      newGame: "Nova partida",
      playAgain: "Jogar Novamente",
      waiting: "Aguardando outros jogadores...",
    },
    // Rules Modal
    rules: {
      title: "Regras do Jogo",
      button: "Regras",
      objective: {
        title: "Objetivo",
        content: "Seja o primeiro a acumular o número de cartas definido (4, 5 ou 7) para ser coroado o Amigo de M*.",
      },
      howToPlay: {
        title: "Como Jogar",
        step1: "O sistema revela uma carta com uma pergunta.",
        step2: "Todos tem 30 segundos para votar em quem melhor se encaixa na pergunta.",
        step3: "NÃO pode votar em si mesmo.",
        step4: "Após o tempo, os votos são revelados.",
        step5: "Quem recebeu mais votos ganha a carta.",
        step6: "Em caso de empate, ninguém ganha a carta.",
      },
      endGame: {
        title: "Fim de Jogo",
        content: "O primeiro jogador a atingir o número alvo de cartas vence e se torna o Amigo de M* do grupo!",
      },
      tips: {
        title: "Dicas",
        tip1: "Seja honesto — as respostas mais engraçadas são as mais sinceras!",
        tip2: "Vote rápido — só tem 30 segundos!",
        tip3: "Não leve para o lado pessoal — é só um jogo!",
      },
    },
    // Game Board
    game: {
      round: "Rodada",
      timeLeft: "Tempo",
      waiting: "Aguardando votos...",
      votedCount: "votou",
      selectPlayer: "Selecione um jogador",
      cannotVoteSelf: "Não pode votar em si mesmo",
      voteButton: "Confirmar Voto",
      voteLocked: "Voto Confirmado",
    },
  },
  en: {
    // Home page
    home: {
      title: "Sh*tty Friends",
      subtitle: "WorstFriend",
      description: "Voting game • 3+ players",
      namePlaceholder: "Your name",
      cards: "cards",
      createRoom: "Create Room",
      orJoin: "or join a room",
      roomCodeLabel: "CODE",
      roomCodePlaceholder: "Enter room code",
      joinRoom: "Join Room",
      errorName: "Enter your name",
      errorCode: "Enter room code",
    },
    // Lobby
    lobby: {
      title: "Waiting Room",
      roomCode: "Room code",
      copyCode: "Click to copy",
      copyLink: "Copy room link",
      players: "Players",
      you: "(you)",
      host: "HOST",
      cardsToWin: "Cards to win",
      startGame: "Start Game",
      waitingPlayers: "Waiting for players...",
      waitingHost: "Waiting for host to start...",
    },
    // Game Result
    result: {
      tie: "Tie!",
      tieDesc: "Multiple Sh*tty Friends!",
      winner: "won!",
      winnerTitle: "is the official Sh*tty Friend!",
      ranking: "Final Ranking",
      cards: "cards",
      newGame: "New game",
      playAgain: "Play Again",
      waiting: "Waiting for other players...",
    },
    // Rules Modal
    rules: {
      title: "Game Rules",
      button: "Rules",
      objective: {
        title: "Objective",
        content: "Be the first to collect the set number of cards (4, 5, or 7) to be crowned the Sh*tty Friend.",
      },
      howToPlay: {
        title: "How to Play",
        step1: "The system reveals a card with a question.",
        step2: "Everyone has 30 seconds to vote for who best fits the question.",
        step3: "You CANNOT vote for yourself.",
        step4: "After time runs out, votes are revealed.",
        step5: "Whoever gets the most votes wins the card.",
        step6: "In case of a tie, nobody wins the card.",
      },
      endGame: {
        title: "End of Game",
        content: "The first player to reach the target number of cards wins and becomes the group's Sh*tty Friend!",
      },
      tips: {
        title: "Tips",
        tip1: "Be honest — the funniest answers are the most sincere!",
        tip2: "Vote fast — you only have 30 seconds!",
        tip3: "Don't take it personally — it's just a game!",
      },
    },
    // Game Board
    game: {
      round: "Round",
      timeLeft: "Time",
      waiting: "Waiting for votes...",
      votedCount: "voted",
      selectPlayer: "Select a player",
      cannotVoteSelf: "Cannot vote for yourself",
      voteButton: "Confirm Vote",
      voteLocked: "Vote Confirmed",
    },
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.pt;
