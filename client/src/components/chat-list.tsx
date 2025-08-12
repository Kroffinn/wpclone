import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCheck, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ConversationWithContact } from "@shared/schema";

interface ChatListProps {
  conversations: ConversationWithContact[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export default function ChatList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ChatListProps) {
  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    
    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return formatDistanceToNow(messageDate, { addSuffix: false });
    }
  };

  const getStatusIcon = (status: string, sender: string) => {
    if (sender === 'contact') return null;
    
    switch (status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-whatsapp-text" />;
      default:
        return <Check className="h-3 w-3 text-whatsapp-text" />;
    }
  };

  return (
    <div>
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`chat-item flex items-center p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
            selectedConversationId === conversation.id
              ? 'bg-gray-50 border-l-4 border-l-whatsapp-green'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="flex-shrink-0">
            <Avatar className="w-12 h-12 ring-2 ring-gray-100">
              <AvatarImage 
                src={conversation.contact.avatar || undefined} 
                alt={`${conversation.contact.name} profile`}
              />
              <AvatarFallback className="bg-gray-500 text-white font-medium">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-medium text-gray-900 truncate">
                {conversation.contact.name}
              </h3>
              <span className="text-xs text-gray-500 font-normal">
                {formatTime(conversation.lastMessage?.timestamp)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 truncate flex-1 leading-tight">
                {conversation.lastMessage?.content || "No messages yet"}
              </p>
              <div className="flex items-center space-x-2 ml-2">
                {conversation.lastMessage && getStatusIcon(
                  conversation.lastMessage.status!,
                  conversation.lastMessage.sender
                )}
                {conversation.unreadCount! > 0 && selectedConversationId !== conversation.id && (
                  <Badge 
                    variant="default" 
                    className="bg-whatsapp-green text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center font-medium"
                  >
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
