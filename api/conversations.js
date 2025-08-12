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
  const db = client.db('whatsapp-clone');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
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
          from: 'messages',
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
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
}
