import 'dotenv/config';
import { MongoStorage } from '../server/mongo-storage.js';

async function seedSampleData() {
  console.log('🌱 Seeding sample data...');
  
  const storage = new MongoStorage();
  await storage.connect();
  
  // Create sample contacts
  const contacts = [
    {
      waId: '918329446655',
      name: 'John Doe',
      phone: '+1 234 567 8901',
      avatar: null,
      lastSeen: new Date(),
    },
    {
      waId: '918329446656',
      name: 'Jane Smith', 
      phone: '+1 234 567 8902',
      avatar: null,
      lastSeen: new Date(),
    },
    {
      waId: '918329446657',
      name: 'Alice Johnson',
      phone: '+1 234 567 8903', 
      avatar: null,
      lastSeen: new Date(),
    }
  ];
  
  console.log('👥 Creating contacts...');
  const createdContacts: any[] = [];
  for (const contact of contacts) {
    const newContact = await storage.createContact(contact);
    createdContacts.push(newContact);
    console.log(`✅ Created contact: ${contact.name}`);
  }
  
  console.log('💬 Creating conversations...');
  const conversations: any[] = [];
  for (const contact of createdContacts) {
    const conversation = await storage.createConversation({
      contactId: contact.id,
      unreadCount: Math.floor(Math.random() * 5),
    });
    conversations.push({ conversation, contact });
    console.log(`✅ Created conversation with: ${contact.name}`);
  }
  
  console.log('📨 Creating sample messages...');
  const sampleMessages = [
    // Conversation 1 - John Doe
    { text: "Hey! How are you doing?", sender: 'contact', time: -60 },
    { text: "I'm doing great, thanks for asking!", sender: 'user', time: -55 },
    { text: "That's awesome! Are we still on for coffee tomorrow?", sender: 'contact', time: -30 },
    { text: "Absolutely! See you at 10 AM at the usual place.", sender: 'user', time: -25 },
    
    // Conversation 2 - Jane Smith  
    { text: "Did you see the news about the new project?", sender: 'contact', time: -120 },
    { text: "Yes! It looks really exciting. When do we start?", sender: 'user', time: -115 },
    { text: "Monday morning. I'll send you the details.", sender: 'contact', time: -110 },
    { text: "Perfect, looking forward to it!", sender: 'user', time: -105 },
    { text: "Just sent the email with all the info 📧", sender: 'contact', time: -5 },
    
    // Conversation 3 - Alice Johnson
    { text: "Happy birthday! 🎉🎂", sender: 'contact', time: -180 },
    { text: "Thank you so much! That means a lot 🥰", sender: 'user', time: -175 },
    { text: "Hope you have an amazing day!", sender: 'contact', time: -170 },
    { text: "Thanks! Having dinner with family tonight", sender: 'user', time: -165 },
    { text: "That sounds wonderful! Enjoy! 🍽️", sender: 'contact', time: -160 },
  ];
  
  let messageIndex = 0;
  for (let i = 0; i < conversations.length; i++) {
    const { conversation, contact } = conversations[i];
    const messagesPerConv = i === 0 ? 4 : i === 1 ? 5 : 5; // Different number of messages per conversation
    
    for (let j = 0; j < messagesPerConv; j++) {
      const msgData = sampleMessages[messageIndex++];
      if (!msgData) break;
      
      const timestamp = new Date(Date.now() + msgData.time * 60 * 1000); // Convert minutes to milliseconds
      
      await storage.createMessage({
        conversationId: conversation.id,
        waMessageId: `wa_${Date.now()}_${Math.random()}`,
        metaMsgId: `meta_${Date.now()}_${Math.random()}`,
        content: msgData.text,
        messageType: 'text',
        sender: msgData.sender as 'contact' | 'user',
        status: 'delivered',
        timestamp,
      });
      
      console.log(`📨 Added message to ${contact.name}: "${msgData.text.substring(0, 30)}..."`);
    }
  }
  
  console.log('\n📊 Sample Data Summary:');
  console.log(`👥 Contacts: ${createdContacts.length}`);
  console.log(`💬 Conversations: ${conversations.length}`);
  console.log(`📨 Messages: ${messageIndex}`);
  
  console.log('\n✅ Sample data seeded successfully!');
  
  await storage.disconnect();
}

seedSampleData().catch(console.error);
