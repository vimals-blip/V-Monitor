import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket && typeof window !== 'undefined') {
    let wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl && process.env.NEXT_PUBLIC_API_URL) {
      wsUrl = process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '');
    }
    if (!wsUrl) {
      wsUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
    }
    socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
  }
  return socket!;
}
