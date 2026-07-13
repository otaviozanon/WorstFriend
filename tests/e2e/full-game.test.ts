// @vitest-environment node

import { describe, it, expect } from "vitest";
import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3000";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createClient(): Socket {
  return io(URL, { autoConnect: false, transports: ["websocket"] });
}

async function setupGame() {
  const host = createClient();
  const p2 = createClient();
  const p3 = createClient();

  const hostReady = new Promise<any>((resolve) => host.on("room:state", resolve));
  host.connect();
  host.emit("room:create", { playerName: "Host" });
  const room = await hostReady;
  const roomCode = room.code;

  return { host, p2, p3, room, roomCode };
}

describe("Full Game Flow", () => {
  it("complete game: create, join, vote, win", async () => {
    const { host, p2, p3, roomCode } = await setupGame();

    let p2id = "";
    let p3id = "";

    const p2Ready = new Promise<any>((resolve) => {
      p2.on("room:state", resolve);
      p2.on("player:id", (id: string) => { p2id = id; });
    });
    p2.connect();
    p2.emit("room:join", { roomCode, playerName: "Player2" });
    await p2Ready;

    const p3Ready = new Promise<any>((resolve) => {
      p3.on("room:state", resolve);
      p3.on("player:id", (id: string) => { p3id = id; });
    });
    p3.connect();
    p3.emit("room:join", { roomCode, playerName: "Player3" });
    await p3Ready;

    const gameStarted = new Promise<any>((resolve) => {
      p2.on("room:state", (state: any) => {
        if (state.status === "voting") resolve(state);
      });
    });
    host.emit("game:start", { cardsToWin: 5 });
    const gameState = await gameStarted;
    expect(gameState.status).toBe("voting");
    expect(gameState.rounds).toHaveLength(1);

    p2.emit("game:vote", { targetId: p3id });
    p3.emit("game:vote", { targetId: p2id });

    const revealDone = new Promise<any>((resolve) => {
      host.on("room:state", (state: any) => {
        if (state.status === "revealing") resolve(state);
      });
    });
    host.emit("game:vote", { targetId: p3id });

    const revealed = await revealDone;
    expect(revealed.status).toBe("revealing");
    expect(revealed.rounds[0].winnerId).toBe(p3id);

    host.disconnect();
    p2.disconnect();
    p3.disconnect();
  }, 15000);

  it("tie results in no winner", async () => {
    const { host, p2, p3, room, roomCode } = await setupGame();
    const p1id = room.players[0].id;

    let p2id = "", p3id = "";

    const p2Ready = new Promise<any>((resolve) => {
      p2.on("room:state", resolve);
      p2.on("player:id", (id: string) => { p2id = id; });
    });
    p2.connect();
    p2.emit("room:join", { roomCode, playerName: "Player2" });
    await p2Ready;

    const p3Ready = new Promise<any>((resolve) => {
      p3.on("room:state", resolve);
      p3.on("player:id", (id: string) => { p3id = id; });
    });
    p3.connect();
    p3.emit("room:join", { roomCode, playerName: "Player3" });
    await p3Ready;

    const gameStarted = new Promise<any>((resolve) => {
      host.on("room:state", (state: any) => {
        if (state.status === "voting") resolve(state);
      });
    });
    host.emit("game:start", { cardsToWin: 5 });
    await gameStarted;

    host.emit("game:vote", { targetId: p3id });
    p2.emit("game:vote", { targetId: p1id });
    p3.emit("game:vote", { targetId: p2id });

    const revealDone = new Promise<any>((resolve) => {
      host.on("room:state", (state: any) => {
        if (state.status === "revealing") resolve(state);
      });
    });
    const revealed = await revealDone;
    expect(revealed.rounds[0].winnerId).toBeNull();

    host.disconnect();
    p2.disconnect();
    p3.disconnect();
  }, 15000);

  it("self-vote is rejected", async () => {
    const { host, p2, p3, room, roomCode } = await setupGame();
    const p1id = room.players[0].id;

    const p2Ready = new Promise<any>((resolve) => {
      p2.on("room:state", resolve);
    });
    p2.connect();
    p2.emit("room:join", { roomCode, playerName: "Player2" });
    await p2Ready;

    const p3Ready = new Promise<any>((resolve) => {
      p3.on("room:state", resolve);
    });
    p3.connect();
    p3.emit("room:join", { roomCode, playerName: "Player3" });
    await p3Ready;

    const errorPromise = new Promise<string>((resolve) => {
      host.on("error", ({ message }: { message: string }) => resolve(message));
    });

    const gameStarted = new Promise<any>((resolve) => {
      host.on("room:state", (state: any) => {
        if (state.status === "voting") resolve(state);
      });
    });
    host.emit("game:start", { cardsToWin: 5 });
    await gameStarted;

    host.emit("game:vote", { targetId: p1id });
    const error = await errorPromise;
    expect(error).toBe("Voce nao pode votar em si mesmo");

    host.disconnect();
    p2.disconnect();
    p3.disconnect();
  }, 15000);
});
