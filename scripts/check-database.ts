import 'dotenv/config';
import { MongoStorage } from '../server/mongo-storage.js';

async function checkDatabase() {
  console.log('🔍 Checking MongoDB database contents...');
  
  const storage = new MongoStorage();
  await storage.connect();
  
  try {
    // Check conversations (which includes contacts)
    console.log('\n💬 CONVERSATIONS:');
    const conversations = await storage.getConversationsWithContacts();
    console.log(`Found ${conversations.length} conversations:`);
    
    const contacts = new Set();
    conversations.forEach((conv, index) => {
      contacts.add(conv.contact.name);
      console.log(`${index + 1}. Conversation with ${conv.contact.name} (${conv.contact.phone}) - Unread: ${conv.unreadCount || 0}`);
    });
    
    // Check messages for each conversation
    console.log('\n📨 MESSAGES:');
    let totalMessages = 0;
    for (const conv of conversations) {
      const messages = await storage.getMessagesByConversation(conv.id);
      totalMessages += messages.length;
      console.log(`\n💬 Messages with ${conv.contact.name} (${messages.length} messages):`);
      
      if (messages.length === 0) {
        console.log('   No messages found');
      } else {
        // Show last 3 messages
        messages.slice(-3).forEach((msg, index) => {
          const sender = msg.sender === 'contact' ? conv.contact.name : 'You';
          const time = msg.timestamp?.toLocaleString() || 'Unknown time';
          console.log(`   ${sender}: "${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}" (${time})`);
        });
        if (messages.length > 3) {
          console.log(`   ... and ${messages.length - 3} more messages`);
        }
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`👥 Unique Contacts: ${contacts.size}`);
    console.log(`💬 Total Conversations: ${conversations.length}`);
    console.log(`📨 Total Messages: ${totalMessages}`);
    
    if (conversations.length === 0) {
      console.log('\n⚠️ No data found in database!');
      console.log('💡 Run "npm run seed-data" to add sample data');
    } else {
      console.log('\n✅ Database has data!');
      console.log('🌐 Your API endpoints should be returning this data');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await storage.disconnect();
  }
}

checkDatabase().catch(console.error);
