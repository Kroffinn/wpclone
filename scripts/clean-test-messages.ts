import "dotenv/config";
import { MongoClient } from 'mongodb';

async function cleanTestMessages() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db('whatsapp');
    const messagesCollection = db.collection('processed_messages');
    const conversationsCollection = db.collection('conversations');
    const contactsCollection = db.collection('contacts');

    // Find and delete test messages that contain simulation patterns
    const testMessagePatterns = [
      /This is a simulated real-time message sent at/i,
      /simulated.*message/i,
      /test.*message/i,
      /demo.*message/i,
      /sample.*message/i,
      /Hey! How's the project going/i,
      /Thanks for checking in! The project is going well/i,
      /Perfect! Let me know if you run into any issues/i,
      /Will do! The MongoDB setup went smoothly/i,
      /Great! That's one of the trickier parts/i,
      /Thanks for the update! 👍/i,
      /Got it! I'll send the final version tomorrow/i
    ];

    console.log('🔍 Finding test messages...');
    
    // Create a regex pattern that matches any of the test patterns
    const combinedPattern = new RegExp(
      testMessagePatterns.map(p => p.source).join('|'), 
      'i'
    );

    const testMessages = await messagesCollection.find({
      content: { $regex: combinedPattern }
    }).toArray();

    console.log(`📊 Found ${testMessages.length} test messages to delete`);

    if (testMessages.length > 0) {
      // Delete the test messages
      const deleteResult = await messagesCollection.deleteMany({
        content: { $regex: combinedPattern }
      });

      console.log(`🗑️  Deleted ${deleteResult.deletedCount} test messages`);

      // Clean up any conversations that no longer have messages
      console.log('🧹 Cleaning up empty conversations...');
      
      const allConversations = await conversationsCollection.find({}).toArray();
      let deletedConversations = 0;
      
      for (const conversation of allConversations) {
        const messageCount = await messagesCollection.countDocuments({
          conversationId: conversation._id.toString()
        });
        
        if (messageCount === 0) {
          await conversationsCollection.deleteOne({ _id: conversation._id });
          deletedConversations++;
        } else {
          // Update lastMessageId for conversations that still have messages
          const lastMessage = await messagesCollection.findOne(
            { conversationId: conversation._id.toString() },
            { sort: { timestamp: -1 } }
          );
          
          if (lastMessage) {
            await conversationsCollection.updateOne(
              { _id: conversation._id },
              { 
                $set: { 
                  lastMessageId: lastMessage._id.toString(),
                  updatedAt: lastMessage.timestamp || new Date()
                }
              }
            );
          }
        }
      }

      console.log(`🗑️  Deleted ${deletedConversations} empty conversations`);

      // Clean up any contacts that no longer have conversations
      console.log('🧹 Cleaning up orphaned contacts...');
      
      const allContacts = await contactsCollection.find({}).toArray();
      let deletedContacts = 0;
      
      for (const contact of allContacts) {
        const conversationCount = await conversationsCollection.countDocuments({
          contactId: contact._id.toString()
        });
        
        if (conversationCount === 0) {
          await contactsCollection.deleteOne({ _id: contact._id });
          deletedContacts++;
        }
      }

      console.log(`🗑️  Deleted ${deletedContacts} orphaned contacts`);

      // Show final statistics
      const remainingMessages = await messagesCollection.countDocuments({});
      const remainingConversations = await conversationsCollection.countDocuments({});
      const remainingContacts = await contactsCollection.countDocuments({});

      console.log('\n📊 Final Database Statistics:');
      console.log(`   Messages: ${remainingMessages}`);
      console.log(`   Conversations: ${remainingConversations}`);
      console.log(`   Contacts: ${remainingContacts}`);

    } else {
      console.log('✨ No test messages found - database is already clean!');
    }

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('✅ Database cleanup completed');
  }
}

// Run the cleanup
cleanTestMessages().catch(console.error);
