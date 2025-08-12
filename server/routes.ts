import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage.js";
import { insertMessageSchema, insertContactSchema, webhookPayloadSchema } from "../shared/schema.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation-${conversationId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Get all conversations with contacts
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversationsWithContacts();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get conversation with messages
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversationWithMessages(id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Send a new message
  app.post("/api/messages", async (req, res) => {
    try {
      console.log('📨 Received message data:', JSON.stringify(req.body, null, 2));
      
      // Basic validation for required fields
      const { conversationId, content, sender } = req.body;
      
      if (!conversationId || !content || !sender) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          required: ["conversationId", "content", "sender"] 
        });
      }

      const messageData = {
        conversationId,
        content,
        sender,
        messageType: req.body.messageType || "text",
        status: req.body.status || "sent",
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
        waMessageId: req.body.waMessageId || null,
        metaMsgId: req.body.metaMsgId || null,
      };
      
      console.log('✅ Processed message data:', JSON.stringify(messageData, null, 2));
      
      const message = await storage.createMessage(messageData);
      
      // Emit to all clients in the conversation room
      io.to(`conversation-${message.conversationId}`).emit('new-message', message);
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ 
        message: "Failed to create message", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Process webhook payload
  app.post("/api/webhook", async (req, res) => {
    try {
      const payload = webhookPayloadSchema.parse(req.body);
      
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          const { value } = change;
          
          // Process incoming messages
          if (value.messages) {
            for (const message of value.messages) {
              // Find or create contact
              let contact = await storage.getContactByWaId(message.from);
              if (!contact) {
                // Look for contact info in the payload
                const contactInfo = value.contacts?.find(c => c.wa_id === message.from);
                contact = await storage.createContact({
                  waId: message.from,
                  name: contactInfo?.profile?.name || `Contact ${message.from}`,
                  phone: message.from,
                  avatar: null,
                  lastSeen: new Date(),
                });
              }

              // Find or create conversation
              let conversation = await storage.getConversationByContactId(contact.id);
              if (!conversation) {
                conversation = await storage.createConversation({
                  contactId: contact.id,
                  unreadCount: 1,
                });
              } else {
                // Increment unread count
                await storage.updateConversation(conversation.id, {
                  unreadCount: (conversation.unreadCount || 0) + 1,
                });
              }

              // Create message
              const messageContent = message.text?.body || "Unsupported message type";
              const newMessage = await storage.createMessage({
                conversationId: conversation.id,
                waMessageId: message.id,
                content: messageContent,
                messageType: message.type,
                sender: "contact",
                status: "delivered",
                timestamp: new Date(parseInt(message.timestamp) * 1000),
              });

              // Emit to all clients in the conversation room
              io.to(`conversation-${conversation.id}`).emit('new-message', newMessage);
            }
          }

          // Process status updates
          if (value.statuses) {
            for (const status of value.statuses) {
              const updatedMessage = await storage.updateMessageStatus(status.id, status.status);
              if (updatedMessage) {
                // Emit status update to all clients in the conversation room
                io.to(`conversation-${updatedMessage.conversationId}`).emit('message-status-update', {
                  messageId: updatedMessage.id,
                  status: updatedMessage.status,
                });
              }
            }
          }
        }
      }

      res.status(200).json({ message: "Webhook processed successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid webhook payload", errors: error.errors });
      }
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // Mark conversation as read
  app.patch("/api/conversations/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.updateConversation(id, { unreadCount: 0 });
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      res.status(500).json({ message: "Failed to mark conversation as read" });
    }
  });

  // Get contact by wa_id
  app.get("/api/contacts/wa/:waId", async (req, res) => {
    try {
      const { waId } = req.params;
      const contact = await storage.getContactByWaId(waId);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      res.json(contact);
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  return httpServer;
}
