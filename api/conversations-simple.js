// Simple test to see if API works at all
export default async function handler(req, res) {
  console.log('Simple conversations API called');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Return hardcoded test data first
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

  console.log('Returning test conversations:', testConversations.length);
  res.json(testConversations);
}
