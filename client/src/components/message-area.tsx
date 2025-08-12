import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import MessageBubble from "@/components/message-bubble";
import type { ConversationWithMessages } from "@shared/schema";

interface MessageAreaProps {
  conversation: ConversationWithMessages;
  isLoading: boolean;
}

export default function MessageArea({ conversation, isLoading }: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4 message-background">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className="max-w-xs lg:max-w-md">
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 scroll-container message-background">
      {conversation.messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          contact={conversation.contact}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
