import { Room } from "@/game-engine/types";

const rooms = new Map<string, Room>();

export function getRoom(roomCode: string): Room | undefined {
  return rooms.get(roomCode);
}

export function setRoom(roomCode: string, room: Room): void {
  rooms.set(roomCode, room);
}

export function deleteRoom(roomCode: string): void {
  rooms.delete(roomCode);
}

const socketToPlayer = new Map<string, { roomCode: string; playerId: string }>();
const playerToSocket = new Map<string, string>();

export function mapSocketToPlayer(socketId: string, roomCode: string, playerId: string): void {
  socketToPlayer.set(socketId, { roomCode, playerId });
  playerToSocket.set(playerId, socketId);
}

export function removeSocketMapping(socketId: string): { roomCode: string; playerId: string } | undefined {
  const mapping = socketToPlayer.get(socketId);
  if (mapping) {
    socketToPlayer.delete(socketId);
    playerToSocket.delete(mapping.playerId);
  }
  return mapping;
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  const mapping = socketToPlayer.get(socketId);
  if (!mapping) return undefined;
  return rooms.get(mapping.roomCode);
}

export function getPlayerIdBySocketId(socketId: string): string | undefined {
  return socketToPlayer.get(socketId)?.playerId;
}
