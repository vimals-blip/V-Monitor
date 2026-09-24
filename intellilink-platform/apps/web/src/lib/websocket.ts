import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket && typeof window !== 'undefined') {
    const wsUrl = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : (process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001');
    socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
  }
  return socket!;
}
