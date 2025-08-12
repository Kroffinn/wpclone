import { useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<any | null>(null);

  useEffect(() => {
    // Temporarily disabled Socket.IO for Vercel deployment
    console.log('Socket.IO temporarily disabled - using API-only mode');
    
    // const socketInstance = io(window.location.origin, {
    //   transports: ['websocket', 'polling']
    // });

    // socketInstance.on('connect', () => {
    //   console.log('Connected to WebSocket server');
    // });

    // socketInstance.on('disconnect', () => {
    //   console.log('Disconnected from WebSocket server');
    // });

    // socketInstance.on('connect_error', (error) => {
    //   console.error('WebSocket connection error:', error);
    // });

    // setSocket(socketInstance);

    // return () => {
    //   socketInstance.disconnect();
    // };
  }, []);

  return socket;
}
