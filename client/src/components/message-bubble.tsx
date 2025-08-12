import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, CheckCheck, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Message, Contact } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
  contact: Contact;
}

export default function MessageBubble({ message, contact }: MessageBubbleProps) {
  const isReceived = message.sender === 'contact';
  
  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    if (isReceived) return null;
    
    switch (message.status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-whatsapp-text" />;
      default:
        return <Check className="h-3 w-3 text-whatsapp-text" />;
    }
  };

  if (isReceived) {
    return (
      <div className="flex items-start space-x-2 mb-4">
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8 ring-1 ring-gray-200">
            <AvatarImage 
              src={contact.avatar || undefined}
              alt={`${contact.name} profile`}
            />
            <AvatarFallback className="bg-gray-500 text-white text-xs">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100 relative">
            <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white"></div>
            <p className="text-sm text-gray-900 leading-relaxed">{message.content}</p>
            <div className="flex items-center justify-end mt-1">
              <span className="text-[11px] text-gray-500 font-normal">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-end space-x-2 mb-4">
      <div className="max-w-xs lg:max-w-md">
        <div className="bg-green-100 rounded-lg px-3 py-2 shadow-sm border border-green-200 relative">
          <div className="absolute -right-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-green-100"></div>
          <p className="text-sm text-gray-900 leading-relaxed">{message.content}</p>
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-[11px] text-gray-600 font-normal">
              {formatTime(message.timestamp)}
            </span>
            {getStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
}
