import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const mongoUrl = process.env.MONGODB_URI;
  if (!mongoUrl) {
    throw new Error('MONGODB_URI not configured');
  }

  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db('whatsapp');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { conversationId, content, sender } = req.body;
    
    if (!conversationId || !content || !sender) {
      return res.status(400).json({ 
        message: "Missing required fields" 
      });
    }
    
    const message = {
      _id: crypto.randomUUID(),
      conversationId,
      content,
      sender,
      messageType: req.body.messageType || "text",
      status: req.body.status || "sent",
      timestamp: new Date(),
      waMessageId: req.body.waMessageId || null,
      metaMsgId: req.body.metaMsgId || null,
    };
    
    const { db } = await connectToDatabase();
    await db.collection('processed_messages').insertOne(message);
    
    // Emit to Socket.IO if server is available
    if (res.socket?.server?.io) {
      res.socket.server.io.to(`conversation-${conversationId}`).emit('new-message', message);
    }
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Failed to create message' });
  }
}
