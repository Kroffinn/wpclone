import { MongoClient, ObjectId } from 'mongodb';

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
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      
      // Get conversation with contact details
      const conversation = await db.collection('conversations').aggregate([
        {
          $match: { _id: new ObjectId(id) }
        },
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
        }
      ]).toArray();

      if (conversation.length === 0) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      // Get messages for this conversation
      const messages = await db.collection('processed_messages')
        .find({ conversationId: id })
        .sort({ timestamp: 1 })
        .toArray();

      // Combine conversation with messages
      const result = {
        id: conversation[0]._id.toString(),
        contactId: conversation[0].contactId,
        unreadCount: conversation[0].unreadCount || 0,
        updatedAt: conversation[0].updatedAt,
        contact: {
          id: conversation[0].contact._id.toString(),
          waId: conversation[0].contact.waId,
          name: conversation[0].contact.name,
          phone: conversation[0].contact.phone,
          avatar: conversation[0].contact.avatar,
          lastSeen: conversation[0].contact.lastSeen,
          createdAt: conversation[0].contact.createdAt
        },
        messages: messages.map(msg => ({
          id: msg._id.toString(),
          conversationId: msg.conversationId,
          waMessageId: msg.waMessageId,
          metaMsgId: msg.metaMsgId,
          content: msg.content,
          messageType: msg.messageType,
          sender: msg.sender,
          status: msg.status,
          timestamp: msg.timestamp,
          createdAt: msg.createdAt
        }))
      };

      res.json(result);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ message: 'Failed to fetch conversation' });
    }
  } else if (req.method === 'PATCH') {
    // Handle marking conversation as read
    try {
      const { db } = await connectToDatabase();
      
      await db.collection('conversations').updateOne(
        { _id: new ObjectId(id) },
        { $set: { unreadCount: 0 } }
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating conversation:', error);
      res.status(500).json({ message: 'Failed to update conversation' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
