import { 
  type Contact, 
  type InsertContact,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type ConversationWithContact,
  type ConversationWithMessages
} from "@shared/schema";
import { randomUUID } from "crypto";
import { MongoStorage } from "./mongo-storage.js";

export interface IStorage {
  // Contact operations
  getContact(id: string): Promise<Contact | undefined>;
  getContactByWaId(waId: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<Contact>): Promise<Contact | undefined>;

  // Conversation operations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationByContactId(contactId: string): Promise<Conversation | undefined>;
  getConversationsWithContacts(): Promise<ConversationWithContact[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<Conversation>): Promise<Conversation | undefined>;

  // Message operations
  getMessage(id: string): Promise<Message | undefined>;
  getMessageByWaId(waMessageId: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  getConversationWithMessages(conversationId: string): Promise<ConversationWithMessages | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, message: Partial<Message>): Promise<Message | undefined>;
  updateMessageStatus(waMessageId: string, status: string): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private contacts: Map<string, Contact>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;

  constructor() {
    this.contacts = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.seedData();
  }

  private seedData() {
    // Create sample contacts
    const contact1: Contact = {
      id: "contact-1",
      waId: "1234567890",
      name: "John Mitchell",
      phone: "+1 555 0123",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      lastSeen: new Date(),
      createdAt: new Date(),
    };

    const contact2: Contact = {
      id: "contact-2",
      waId: "0987654321",
      name: "Sarah Johnson",
      phone: "+1 555 0124",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      lastSeen: new Date(),
      createdAt: new Date(),
    };

    const contact3: Contact = {
      id: "contact-3",
      waId: "1122334455",
      name: "Michael Chen",
      phone: "+1 555 0125",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      lastSeen: new Date(),
      createdAt: new Date(),
    };

    this.contacts.set(contact1.id, contact1);
    this.contacts.set(contact2.id, contact2);
    this.contacts.set(contact3.id, contact3);

    // Create conversations
    const conv1: Conversation = {
      id: "conv-1",
      contactId: contact1.id,
      lastMessageId: null,
      unreadCount: 3,
      updatedAt: new Date(),
    };

    const conv2: Conversation = {
      id: "conv-2",
      contactId: contact2.id,
      lastMessageId: null,
      unreadCount: 0,
      updatedAt: new Date(),
    };

    const conv3: Conversation = {
      id: "conv-3",
      contactId: contact3.id,
      lastMessageId: null,
      unreadCount: 1,
      updatedAt: new Date(),
    };

    this.conversations.set(conv1.id, conv1);
    this.conversations.set(conv2.id, conv2);
    this.conversations.set(conv3.id, conv3);

    // Create sample messages
    const messages: Message[] = [
      {
        id: "msg-1",
        conversationId: conv1.id,
        waMessageId: "wa-msg-1",
        metaMsgId: null,
        content: "Hey! How's the project going? I wanted to check if you need any help with the implementation.",
        messageType: "text",
        sender: "contact",
        status: "delivered",
        timestamp: new Date("2024-08-12T14:30:00"),
        createdAt: new Date("2024-08-12T14:30:00"),
      },
      {
        id: "msg-2",
        conversationId: conv1.id,
        waMessageId: "wa-msg-2",
        metaMsgId: null,
        content: "Thanks for checking in! The project is going well. I'm currently working on the webhook processor and should have it done by tomorrow.",
        messageType: "text",
        sender: "user",
        status: "read",
        timestamp: new Date("2024-08-12T14:31:00"),
        createdAt: new Date("2024-08-12T14:31:00"),
      },
      {
        id: "msg-3",
        conversationId: conv1.id,
        waMessageId: "wa-msg-3",
        metaMsgId: null,
        content: "Perfect! Let me know if you run into any issues. I can help with the database setup if needed.",
        messageType: "text",
        sender: "contact",
        status: "delivered",
        timestamp: new Date("2024-08-12T14:32:00"),
        createdAt: new Date("2024-08-12T14:32:00"),
      },
      {
        id: "msg-4",
        conversationId: conv1.id,
        waMessageId: "wa-msg-4",
        metaMsgId: null,
        content: "Will do! The MongoDB setup went smoothly. Just working on the message status tracking now.",
        messageType: "text",
        sender: "user",
        status: "read",
        timestamp: new Date("2024-08-12T14:33:00"),
        createdAt: new Date("2024-08-12T14:33:00"),
      },
      {
        id: "msg-5",
        conversationId: conv1.id,
        waMessageId: "wa-msg-5",
        metaMsgId: null,
        content: "Great! That's one of the trickier parts. Make sure to handle the id and meta_msg_id fields correctly for status updates.",
        messageType: "text",
        sender: "contact",
        status: "delivered",
        timestamp: new Date("2024-08-12T14:34:00"),
        createdAt: new Date("2024-08-12T14:34:00"),
      },
      {
        id: "msg-6",
        conversationId: conv2.id,
        waMessageId: "wa-msg-6",
        metaMsgId: null,
        content: "Thanks for the update! 👍",
        messageType: "text",
        sender: "contact",
        status: "read",
        timestamp: new Date("2024-08-12T13:45:00"),
        createdAt: new Date("2024-08-12T13:45:00"),
      },
      {
        id: "msg-7",
        conversationId: conv3.id,
        waMessageId: "wa-msg-7",
        metaMsgId: null,
        content: "Got it! I'll send the final version tomorrow.",
        messageType: "text",
        sender: "contact",
        status: "delivered",
        timestamp: new Date("2024-08-11T16:20:00"),
        createdAt: new Date("2024-08-11T16:20:00"),
      },
    ];

    messages.forEach(msg => this.messages.set(msg.id, msg));

    // Update last message IDs
    conv1.lastMessageId = "msg-5";
    conv2.lastMessageId = "msg-6";
    conv3.lastMessageId = "msg-7";
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getContactByWaId(waId: string): Promise<Contact | undefined> {
    return Array.from(this.contacts.values()).find(contact => contact.waId === waId);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      avatar: insertContact.avatar || null,
      lastSeen: insertContact.lastSeen || null,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: string, contactUpdate: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;

    const updated = { ...contact, ...contactUpdate };
    this.contacts.set(id, updated);
    return updated;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationByContactId(contactId: string): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(conv => conv.contactId === contactId);
  }

  async getConversationsWithContacts(): Promise<ConversationWithContact[]> {
    const conversations = Array.from(this.conversations.values()).sort((a, b) => 
      new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
    );

    const result: ConversationWithContact[] = [];
    
    for (const conversation of conversations) {
      const contact = await this.getContact(conversation.contactId);
      if (contact) {
        const lastMessage = conversation.lastMessageId 
          ? await this.getMessage(conversation.lastMessageId)
          : undefined;

        result.push({
          ...conversation,
          contact,
          lastMessage,
        });
      }
    }

    return result;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      lastMessageId: insertConversation.lastMessageId || null,
      unreadCount: insertConversation.unreadCount || null,
      updatedAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, conversationUpdate: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;

    const updated = { ...conversation, ...conversationUpdate, updatedAt: new Date() };
    this.conversations.set(id, updated);
    return updated;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessageByWaId(waMessageId: string): Promise<Message | undefined> {
    return Array.from(this.messages.values()).find(msg => msg.waMessageId === waMessageId);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async getConversationWithMessages(conversationId: string): Promise<ConversationWithMessages | undefined> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return undefined;

    const contact = await this.getContact(conversation.contactId);
    if (!contact) return undefined;

    const messages = await this.getMessagesByConversation(conversationId);

    return {
      ...conversation,
      contact,
      messages,
    };
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      timestamp: insertMessage.timestamp || new Date(),
      status: insertMessage.status || null,
      waMessageId: insertMessage.waMessageId || null,
      metaMsgId: insertMessage.metaMsgId || null,
      messageType: insertMessage.messageType || null,
    };
    this.messages.set(id, message);

    // Update conversation's last message and timestamp
    const conversation = await this.getConversation(message.conversationId);
    if (conversation) {
      await this.updateConversation(conversation.id, {
        lastMessageId: message.id,
        updatedAt: new Date(),
      });
    }

    return message;
  }

  async updateMessage(id: string, messageUpdate: Partial<Message>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updated = { ...message, ...messageUpdate };
    this.messages.set(id, updated);
    return updated;
  }

  async updateMessageStatus(waMessageId: string, status: string): Promise<Message | undefined> {
    const message = await this.getMessageByWaId(waMessageId);
    if (!message) return undefined;

    return this.updateMessage(message.id, { status });
  }
}

// Storage factory
class StorageFactory {
  private static instance: IStorage | null = null;
  private static initPromise: Promise<IStorage> | null = null;

  static async getInstance(): Promise<IStorage> {
    if (this.instance) {
      return this.instance;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initializeStorage();
    this.instance = await this.initPromise;
    return this.instance;
  }

  private static async initializeStorage(): Promise<IStorage> {
    if (process.env.MONGODB_URI) {
      console.log('🔧 Initializing MongoDB storage...');
      console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
      const mongoStorage = new MongoStorage();
      await mongoStorage.connect();
      console.log('✅ MongoDB storage initialized successfully');
      return mongoStorage;
    } else {
      console.log('⚠️  No MongoDB URI found, using in-memory storage');
      return new MemStorage();
    }
  }
}

// Export a proxy that forwards calls to the actual storage
export const storage: IStorage = new Proxy({} as IStorage, {
  get: function(target, prop) {
    return async function(...args: any[]) {
      const actualStorage = await StorageFactory.getInstance();
      const method = (actualStorage as any)[prop];
      if (typeof method === 'function') {
        return method.apply(actualStorage, args);
      }
      return method;
    };
  }
});
