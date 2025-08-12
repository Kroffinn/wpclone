import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import type { IStorage } from './storage';
import type { 
  Contact, 
  InsertContact, 
  Conversation, 
  InsertConversation, 
  Message, 
  InsertMessage,
  ConversationWithContact,
  ConversationWithMessages 
} from '../shared/schema.js';

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db!: Db;
  private contacts!: Collection;
  private conversations!: Collection;
  private processedMessages!: Collection;
  private connected = false;

  constructor(connectionString?: string) {
    // Use Atlas connection string from environment or provided string
    const mongoUri = connectionString || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB connection string is required. Please set MONGODB_URI environment variable.');
    }
    
    this.client = new MongoClient(mongoUri);
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    
    try {
      console.log('🔌 Connecting to MongoDB Atlas...');
      await this.client.connect();
      
      // Test the connection
      await this.client.db("admin").command({ ping: 1 });
      console.log('🏓 MongoDB Atlas connection successful!');
      
      this.db = this.client.db('whatsapp');
      this.contacts = this.db.collection('contacts');
      this.conversations = this.db.collection('conversations');
      this.processedMessages = this.db.collection('processed_messages');
      
      // Create indexes for better performance
      await this.contacts.createIndex({ waId: 1 }, { unique: true });
      await this.conversations.createIndex({ contactId: 1 });
      await this.processedMessages.createIndex({ conversationId: 1 });
      await this.processedMessages.createIndex({ waMessageId: 1 });
      await this.processedMessages.createIndex({ metaMsgId: 1 });
      
      this.connected = true;
      console.log('✅ Connected to MongoDB - whatsapp database');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }

  private ensureConnection(): void {
    if (!this.connected) {
      throw new Error('MongoDB connection not established. Call connect() first.');
    }
  }

  // Contact methods
  async getContact(id: string): Promise<Contact | undefined> {
    this.ensureConnection();
    
    const contact = await this.contacts.findOne({ _id: new ObjectId(id) });
    if (!contact) return undefined;
    
    return {
      id: contact._id.toString(),
      waId: contact.waId,
      name: contact.name,
      phone: contact.phone,
      avatar: contact.avatar || null,
      lastSeen: contact.lastSeen || null,
      createdAt: contact.createdAt || null,
    };
  }

  async getContactByWaId(waId: string): Promise<Contact | undefined> {
    this.ensureConnection();
    
    const contact = await this.contacts.findOne({ waId });
    if (!contact) return undefined;
    
    return {
      id: contact._id.toString(),
      waId: contact.waId,
      name: contact.name,
      phone: contact.phone,
      avatar: contact.avatar || null,
      lastSeen: contact.lastSeen || null,
      createdAt: contact.createdAt || null,
    };
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    this.ensureConnection();
    
    const contact = {
      ...insertContact,
      _id: new ObjectId(),
      createdAt: new Date(),
    };
    
    await this.contacts.insertOne(contact);
    
    return {
      id: contact._id.toString(),
      ...insertContact,
      avatar: insertContact.avatar || null,
      lastSeen: insertContact.lastSeen || null,
      createdAt: contact.createdAt,
    };
  }

  async updateContact(id: string, contactUpdate: Partial<Contact>): Promise<Contact | undefined> {
    this.ensureConnection();
    
    const result = await this.contacts.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: contactUpdate },
      { returnDocument: 'after' }
    );
    
    if (!result) return undefined;
    
    return {
      id: result._id.toString(),
      waId: result.waId,
      name: result.name,
      phone: result.phone,
      avatar: result.avatar || null,
      lastSeen: result.lastSeen || null,
      createdAt: result.createdAt || null,
    };
  }

  // Conversation methods
  async getConversation(id: string): Promise<Conversation | undefined> {
    this.ensureConnection();
    
    const conversation = await this.conversations.findOne({ _id: new ObjectId(id) });
    if (!conversation) return undefined;
    
    return {
      id: conversation._id.toString(),
      contactId: conversation.contactId,
      lastMessageId: conversation.lastMessageId || null,
      unreadCount: conversation.unreadCount || null,
      updatedAt: conversation.updatedAt || null,
    };
  }

  async getConversationByContactId(contactId: string): Promise<Conversation | undefined> {
    this.ensureConnection();
    
    const conversation = await this.conversations.findOne({ contactId });
    if (!conversation) return undefined;
    
    return {
      id: conversation._id.toString(),
      contactId: conversation.contactId,
      lastMessageId: conversation.lastMessageId || null,
      unreadCount: conversation.unreadCount || null,
      updatedAt: conversation.updatedAt || null,
    };
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    this.ensureConnection();
    
    const conversation = {
      ...insertConversation,
      _id: new ObjectId(),
      lastMessageId: insertConversation.lastMessageId || null,
      unreadCount: insertConversation.unreadCount || null,
      updatedAt: new Date(),
    };
    
    await this.conversations.insertOne(conversation);
    
    return {
      id: conversation._id.toString(),
      contactId: conversation.contactId,
      lastMessageId: conversation.lastMessageId,
      unreadCount: conversation.unreadCount,
      updatedAt: conversation.updatedAt,
    };
  }

  async getConversationsWithContacts(): Promise<ConversationWithContact[]> {
    this.ensureConnection();
    
    const pipeline = [
      {
        $addFields: {
          contactObjectId: { $toObjectId: "$contactId" }
        }
      },
      {
        $lookup: {
          from: 'contacts',
          localField: 'contactObjectId',
          foreignField: '_id',
          as: 'contact'
        }
      },
      {
        $unwind: '$contact'
      },
      {
        $addFields: {
          lastMessageObjectId: { 
            $cond: {
              if: { $ne: ["$lastMessageId", null] },
              then: { $toObjectId: "$lastMessageId" },
              else: null
            }
          }
        }
      },
      {
        $lookup: {
          from: 'processed_messages',
          localField: 'lastMessageObjectId',
          foreignField: '_id',
          as: 'lastMessage'
        }
      },
      {
        $sort: { updatedAt: -1 }
      }
    ];
    
    const results = await this.conversations.aggregate(pipeline).toArray();
    
    return results.map(result => ({
      id: result._id.toString(),
      contactId: result.contactId,
      lastMessageId: result.lastMessageId || null,
      unreadCount: result.unreadCount || null,
      updatedAt: result.updatedAt || null,
      contact: {
        id: result.contact._id.toString(),
        waId: result.contact.waId,
        name: result.contact.name,
        phone: result.contact.phone,
        avatar: result.contact.avatar || null,
        lastSeen: result.contact.lastSeen || null,
        createdAt: result.contact.createdAt || null,
      },
      lastMessage: result.lastMessage[0] ? {
        id: result.lastMessage[0]._id.toString(),
        conversationId: result.lastMessage[0].conversationId,
        waMessageId: result.lastMessage[0].waMessageId || null,
        metaMsgId: result.lastMessage[0].metaMsgId || null,
        content: result.lastMessage[0].content,
        messageType: result.lastMessage[0].messageType || null,
        sender: result.lastMessage[0].sender,
        status: result.lastMessage[0].status || null,
        timestamp: result.lastMessage[0].timestamp || null,
        createdAt: result.lastMessage[0].createdAt || null,
      } : undefined
    }));
  }

  async updateConversation(id: string, conversationUpdate: Partial<Conversation>): Promise<Conversation | undefined> {
    this.ensureConnection();
    
    const result = await this.conversations.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...conversationUpdate, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) return undefined;
    
    return {
      id: result._id.toString(),
      contactId: result.contactId,
      lastMessageId: result.lastMessageId || null,
      unreadCount: result.unreadCount || null,
      updatedAt: result.updatedAt || null,
    };
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    this.ensureConnection();
    
    const message = await this.processedMessages.findOne({ _id: new ObjectId(id) });
    if (!message) return undefined;
    
    return {
      id: message._id.toString(),
      conversationId: message.conversationId,
      waMessageId: message.waMessageId || null,
      metaMsgId: message.metaMsgId || null,
      content: message.content,
      messageType: message.messageType || null,
      sender: message.sender,
      status: message.status || null,
      timestamp: message.timestamp || null,
      createdAt: message.createdAt || null,
    };
  }

  async getMessageByWaId(waMessageId: string): Promise<Message | undefined> {
    this.ensureConnection();
    
    const message = await this.processedMessages.findOne({ 
      $or: [
        { waMessageId },
        { metaMsgId: waMessageId }
      ]
    });
    
    if (!message) return undefined;
    
    return {
      id: message._id.toString(),
      conversationId: message.conversationId,
      waMessageId: message.waMessageId || null,
      metaMsgId: message.metaMsgId || null,
      content: message.content,
      messageType: message.messageType || null,
      sender: message.sender,
      status: message.status || null,
      timestamp: message.timestamp || null,
      createdAt: message.createdAt || null,
    };
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    this.ensureConnection();
    
    const message = {
      ...insertMessage,
      _id: new ObjectId(),
      status: insertMessage.status || null,
      waMessageId: insertMessage.waMessageId || null,
      metaMsgId: insertMessage.metaMsgId || null,
      messageType: insertMessage.messageType || null,
      createdAt: new Date(),
      timestamp: insertMessage.timestamp || new Date(),
    };
    
    await this.processedMessages.insertOne(message);
    
    // Update conversation's last message and timestamp
    await this.conversations.updateOne(
      { _id: new ObjectId(message.conversationId) },
      { 
        $set: { 
          lastMessageId: message._id.toString(),
          updatedAt: message.timestamp 
        } 
      }
    );
    
    return {
      id: message._id.toString(),
      conversationId: message.conversationId,
      waMessageId: message.waMessageId,
      metaMsgId: message.metaMsgId,
      content: message.content,
      messageType: message.messageType,
      sender: message.sender,
      status: message.status,
      timestamp: message.timestamp,
      createdAt: message.createdAt,
    };
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    this.ensureConnection();
    
    const messages = await this.processedMessages
      .find({ conversationId })
      .sort({ timestamp: 1 })
      .toArray();
    
    return messages.map(msg => ({
      id: msg._id.toString(),
      conversationId: msg.conversationId,
      waMessageId: msg.waMessageId || null,
      metaMsgId: msg.metaMsgId || null,
      content: msg.content,
      messageType: msg.messageType || null,
      sender: msg.sender,
      status: msg.status || null,
      timestamp: msg.timestamp || null,
      createdAt: msg.createdAt || null,
    }));
  }

  async getConversationWithMessages(conversationId: string): Promise<ConversationWithMessages | undefined> {
    this.ensureConnection();
    
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

  async updateMessage(id: string, messageUpdate: Partial<Message>): Promise<Message | undefined> {
    this.ensureConnection();
    
    const result = await this.processedMessages.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: messageUpdate },
      { returnDocument: 'after' }
    );
    
    if (!result) return undefined;
    
    return {
      id: result._id.toString(),
      conversationId: result.conversationId,
      waMessageId: result.waMessageId || null,
      metaMsgId: result.metaMsgId || null,
      content: result.content,
      messageType: result.messageType || null,
      sender: result.sender,
      status: result.status || null,
      timestamp: result.timestamp || null,
      createdAt: result.createdAt || null,
    };
  }

  async updateMessageStatus(waMessageId: string, status: string): Promise<Message | undefined> {
    this.ensureConnection();
    
    const message = await this.processedMessages.findOne({ 
      $or: [
        { waMessageId },
        { metaMsgId: waMessageId }
      ]
    });
    
    if (!message) return undefined;
    
    return this.updateMessage(message._id.toString(), { status });
  }
}
