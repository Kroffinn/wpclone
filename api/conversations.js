module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Return test data
  const conversations = [
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
  
  res.status(200).json(conversations);
};
