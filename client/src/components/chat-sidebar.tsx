import { useState } from "react";
import { User, MessageCircle, MoreVertical, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ChatList from "@/components/chat-list";
import type { ConversationWithContact } from "@shared/schema";

interface ChatSidebarProps {
  conversations: ConversationWithContact[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
  onRefresh?: () => void;
}

export default function ChatSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
  onRefresh,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contact.waId.includes(searchQuery)
  );

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast({
        title: "Refreshed",
        description: "Chat list has been refreshed.",
      });
    }
  };

  const handleNewChat = () => {
    toast({
      title: "New Chat",
      description: "New chat feature coming soon!",
    });
  };

  const handleMoreOptions = () => {
    toast({
      title: "More Options",
      description: "Additional options coming soon!",
    });
  };
  return (
    <>
      {/* Header */}
      <div className="bg-gray-100 p-4 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-gray-200">
              <AvatarFallback className="bg-gray-500 text-white">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-normal text-gray-900">Chats</h1>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoreOptions}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scroll-container bg-white">
        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center p-3 space-x-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ChatList
            conversations={filteredConversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={onSelectConversation}
          />
        )}
      </div>
    </>
  );
}
