// Temporary fallback to use in-memory storage until MongoDB is set up
import 'dotenv/config';
import { MemStorage } from '../server/storage.js';
import { initializeWhatsAppData } from '../server/whatsapp-data.js';

async function runWithInMemoryStorage() {
  console.log('🚀 Starting WhatsApp data processing with in-memory storage...');
  
  const storage = new MemStorage();
  
  // Process the WhatsApp data
  await initializeWhatsAppData(storage);
  
  // Display summary
  const conversations = await storage.getConversationsWithContacts();
  console.log('\n📊 Processing Summary:');
  console.log(`💬 Conversations: ${conversations.length}`);
  
  for (const conv of conversations) {
    const messages = await storage.getMessagesByConversation(conv.id);
    console.log(`\n💬 ${conv.contact.name}: ${messages.length} messages`);
  }
  
  console.log('\n✅ In-memory data processing completed!');
  console.log('💡 To use MongoDB, please set up your database user in MongoDB Atlas');
}

runWithInMemoryStorage().catch(console.error);
