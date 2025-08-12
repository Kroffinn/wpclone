// Vercel-compatible API endpoint
module.exports = async function handler(req, res) {
  console.log('Conversations API called - method:', req.method);
  console.log('URL:', req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Return hardcoded test data
    const testConversations = [
      {
        id: "1",
        contactId: "contact1",
        unreadCount: 2,
        updatedAt: new Date().toISOString(),
        contact: {
          id: "contact1",
          waId: "918329446655",
          name: "Ravi Kumar",
          phone: "919937320320",
          avatar: null,
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        lastMessage: {
          id: "msg1",
          content: "hey",
          sender: "user",
          timestamp: new Date().toISOString(),
          status: "delivered"
        }
      },
      {
        id: "2", 
        contactId: "contact2",
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        contact: {
          id: "contact2",
          waId: "929967673820",
          name: "Neha Joshi",
          phone: "929967673820", 
          avatar: null,
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        lastMessage: {
          id: "msg2",
          content: "Hi, I saw your ad. Can you share more details?",
          sender: "contact",
          timestamp: new Date().toISOString(),
          status: "delivered"
        }
      }
    ];

    console.log('Returning conversations:', testConversations.length);
    res.status(200).json(testConversations);
  } catch (error) {
    console.error('Error in conversations API:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
