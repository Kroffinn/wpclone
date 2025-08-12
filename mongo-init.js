// MongoDB initialization script
db = db.getSiblingDB('whatsapp');

// Create collections
db.createCollection('users');
db.createCollection('conversations');
db.createCollection('messages');
db.createCollection('contacts');

// Create indexes for better performance
db.conversations.createIndex({ "updatedAt": -1 });
db.messages.createIndex({ "conversationId": 1, "timestamp": -1 });
db.contacts.createIndex({ "waId": 1 }, { unique: true });

print('Database initialized successfully!');
