export default async function handler(req, res) {
  // Simple test endpoint that doesn't require database
  const testData = [
    {
      id: "test1",
      contactId: "contact1", 
      unreadCount: 2,
      contact: {
        id: "contact1",
        name: "Test Contact 1",
        phone: "+1234567890",
        avatar: null
      },
      lastMessage: {
        content: "This is a test message",
        timestamp: new Date().toISOString(),
        sender: "contact"
      }
    },
    {
      id: "test2", 
      contactId: "contact2",
      unreadCount: 0,
      contact: {
        id: "contact2",
        name: "Test Contact 2", 
        phone: "+0987654321",
        avatar: null
      },
      lastMessage: {
        content: "Another test message",
        timestamp: new Date().toISOString(),
        sender: "user"
      }
    }
  ];

  res.json(testData);
}
