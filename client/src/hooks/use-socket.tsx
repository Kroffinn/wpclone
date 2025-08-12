import { useEffect, useState } from "react";

export function useSocket() {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Disable Socket.IO for now on Vercel - it doesn't work with serverless functions
    // We'll use simple polling instead
    console.log('Socket.IO disabled for Vercel deployment');
    
    // Create a mock socket object for compatibility
    const mockSocket = {
      emit: (event: string, ...args: any[]) => {
        console.log('Mock socket emit:', event, args);
      },
      on: (event: string, callback: Function) => {
        console.log('Mock socket on:', event);
      },
      off: (event: string, callback: Function) => {
        console.log('Mock socket off:', event);
      },
      disconnect: () => {
        console.log('Mock socket disconnect');
      }
    };

    setSocket(mockSocket);

    return () => {
      // Cleanup
    };
  }, []);

  return socket;
}
