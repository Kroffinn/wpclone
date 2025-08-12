import { useSocket } from "@/hooks/use-socket";
import { Wifi, WifiOff } from "lucide-react";

export default function ConnectionStatus() {
  const socket = useSocket();
  const isConnected = socket?.connected || false;

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
      isConnected 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Disconnected</span>
        </>
      )}
    </div>
  );
}
