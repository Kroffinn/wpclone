import { ArrowLeft, Search, Paperclip, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import type { ConversationWithMessages } from "@shared/schema";

interface ChatHeaderProps {
  conversation: ConversationWithMessages;
  onBack?: () => void;
}

export default function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  const formatLastSeen = (date: Date | string | null) => {
    if (!date) return "last seen recently";
    const lastSeen = new Date(date);
    const now = new Date();
    const isToday = lastSeen.toDateString() === now.toDateString();
    
    if (isToday) {
      return `last seen today at ${lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastSeen.toDateString() === yesterday.toDateString()) {
        return `last seen yesterday at ${lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return `last seen ${lastSeen.toLocaleDateString()}`;
      }
    }
  };

  return (
    <div className="bg-gray-100 p-3 border-b border-gray-300 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="md:hidden text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-200 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="w-10 h-10 ring-2 ring-gray-200">
            <AvatarImage 
              src={conversation.contact.avatar || undefined}
              alt={`${conversation.contact.name} profile`}
            />
            <AvatarFallback className="bg-gray-500 text-white text-sm font-medium">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-medium text-gray-900 text-base">{conversation.contact.name}</h2>
            <p className="text-xs text-gray-500">
              {formatLastSeen(conversation.contact.lastSeen)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-gray-600">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-200 rounded-full">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-200 rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
