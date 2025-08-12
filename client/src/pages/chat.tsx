import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSocket } from "@/hooks/use-socket";
import ChatSidebar from "@/components/chat-sidebar";
import ChatHeader from "@/components/chat-header";
import MessageArea from "@/components/message-area";
import MessageInput from "@/components/message-input";
import type { ConversationWithContact, ConversationWithMessages } from "@shared/schema";

export default function Chat() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = useIsMobile();
  const socket = useSocket();

  // Fetch conversations
  const { data: conversations = [], refetch: refetchConversations, isLoading: conversationsLoading, error: conversationsError } = useQuery<ConversationWithContact[]>({
    queryKey: ["/api/conversations"],
  });

  // Debug logging
  console.log('Conversations loading:', conversationsLoading);
  console.log('Conversations data:', conversations);
  console.log('Conversations error:', conversationsError);

  // Fetch selected conversation with messages
  const { data: selectedConversation, refetch: refetchMessages, isLoading: messagesLoading } = useQuery<ConversationWithMessages>({
    queryKey: ["/api/conversations", selectedConversationId],
    enabled: !!selectedConversationId,
  });

  // Handle conversation selection
  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    if (isMobile) {
      setShowSidebar(false);
    }
    
    // Join conversation room for real-time updates
    if (socket) {
      socket.emit('join-conversation', conversationId);
    }

    // Mark conversation as read
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'PATCH',
      });
      // Refresh conversations to update unread count
      refetchConversations();
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  };

  // Handle back to chat list (mobile)
  const handleBackToList = () => {
    setShowSidebar(true);
    setSelectedConversationId(null);
  };

  // Handle new messages from socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      refetchConversations();
      if (selectedConversationId) {
        refetchMessages();
      }
    };

    const handleStatusUpdate = () => {
      if (selectedConversationId) {
        refetchMessages();
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-status-update', handleStatusUpdate);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-status-update', handleStatusUpdate);
    };
  }, [socket, selectedConversationId, refetchConversations, refetchMessages]);

  // Auto-select first conversation on desktop
  useEffect(() => {
    if (!isMobile && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, isMobile, selectedConversationId]);

  // Handle mobile responsive behavior
  useEffect(() => {
    if (!isMobile) {
      setShowSidebar(true);
    }
  }, [isMobile]);

  return (
    <div className="bg-whatsapp-gray min-h-screen">
      <div className="flex h-screen max-w-none mx-auto bg-white shadow-xl">
        {/* Chat Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-300 flex flex-col bg-white ${
          isMobile && !showSidebar ? 'hidden' : 'flex'
        }`}>
          <ChatSidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            isLoading={conversationsLoading}
            onRefresh={refetchConversations}
          />
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col ${
          isMobile && showSidebar ? 'hidden' : 'flex'
        }`}>
          {selectedConversation ? (
            <>
              <ChatHeader
                conversation={selectedConversation}
                onBack={isMobile ? handleBackToList : undefined}
              />
              <MessageArea
                conversation={selectedConversation}
                isLoading={messagesLoading}
              />
              <MessageInput
                conversationId={selectedConversationId!}
                onMessageSent={() => {
                  refetchConversations();
                  refetchMessages();
                }}
              />
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center message-background">
              <div className="text-center">
                <div className="w-64 h-64 mx-auto mb-8 opacity-10">
                  <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.35L1 23l6.65-2.05C9.96 21.64 11.46 22 13 22h-1c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.4 0-2.74-.35-3.9-.99L7 20l1.01-1.1C7.35 17.74 7 16.4 7 15c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-light text-gray-600 mb-4">WhatsApp Web</h2>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed text-sm">
                  Send and receive messages without keeping your phone online.<br />
                  Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
