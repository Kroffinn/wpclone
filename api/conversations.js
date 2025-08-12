import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const mongoUrl = process.env.MONGODB_URI;
  if (!mongoUrl) {
    console.error('MONGODB_URI environment variable not set');
    throw new Error('MONGODB_URI not configured');
  }

  console.log('Connecting to MongoDB with URI length:', mongoUrl.length);
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db('whatsapp');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  console.log('Conversations API called, method:', req.method);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Connecting to database...');
    const { db } = await connectToDatabase();
    console.log('Database connected, fetching conversations...');
    
    const conversations = await db.collection('conversations').aggregate([
      {
        $lookup: {
          from: 'contacts',
          localField: 'contactId',
          foreignField: '_id',
          as: 'contact'
        }
      },
      {
        $unwind: '$contact'
      },
      {
        $lookup: {
          from: 'processed_messages',
          let: { conversationId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$conversationId', '$$conversationId'] } } },
            { $sort: { timestamp: -1 } },
            { $limit: 1 }
          ],
          as: 'lastMessage'
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]).toArray();
    
    console.log('Found conversations:', conversations.length);
    
    // Map MongoDB _id to id for frontend compatibility
    const mappedConversations = conversations.map(conv => ({
      id: conv._id.toString(),
      contactId: conv.contactId,
      unreadCount: conv.unreadCount || 0,
      updatedAt: conv.updatedAt,
      contact: {
        id: conv.contact._id.toString(),
        waId: conv.contact.waId,
        name: conv.contact.name,
        phone: conv.contact.phone,
        avatar: conv.contact.avatar,
        lastSeen: conv.contact.lastSeen,
        createdAt: conv.contact.createdAt
      },
      lastMessage: conv.lastMessage && conv.lastMessage.length > 0 ? {
        id: conv.lastMessage[0]._id.toString(),
        conversationId: conv.lastMessage[0].conversationId,
        content: conv.lastMessage[0].content,
        sender: conv.lastMessage[0].sender,
        timestamp: conv.lastMessage[0].timestamp,
        status: conv.lastMessage[0].status
      } : null
    }));
    
    res.json(mappedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
  }
}
