import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { MemStorage } from '../server/storage.js';

interface WhatsAppPayload {
  payload_type: string;
  _id: string;
  metaData: {
    entry: Array<{
      changes: Array<{
        field: string;
        value: {
          contacts?: Array<{
            profile: { name: string };
            wa_id: string;
          }>;
          messages?: Array<{
            from: string;
            id: string;
            timestamp: string;
            text: { body: string };
            type: string;
          }>;
          statuses?: Array<{
            id: string;
            meta_msg_id: string;
            recipient_id: string;
            status: string;
            timestamp: string;
          }>;
          messaging_product: string;
          metadata: {
            display_phone_number: string;
            phone_number_id: string;
          };
        };
      }>;
      id: string;
    }>;
    gs_app_id: string;
    object: string;
  };
  createdAt: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const payloadsDir = path.join(__dirname, '..', 'whatsapp sample payloads');

export async function initializeWhatsAppData(storage: MemStorage) {
  console.log('🚀 Initializing WhatsApp data...');
  
  // Check if payloads directory exists
  if (!fs.existsSync(payloadsDir)) {
    console.log('⚠️ WhatsApp payloads directory not found, using demo data');
    return;
  }
  
  // Read all payload files
  const payloadFiles = fs.readdirSync(payloadsDir)
    .filter(file => file.endsWith('.json'))
    .sort(); // Process in order
  
  if (payloadFiles.length === 0) {
    console.log('⚠️ No WhatsApp payload files found, using demo data');
    return;
  }
  
  console.log(`📁 Found ${payloadFiles.length} WhatsApp payload files`);
  
  const businessPhone = "918329446654"; // The business phone number
  const contactMap = new Map<string, string>(); // wa_id -> contact_id
  const conversationMap = new Map<string, string>(); // wa_id -> conversation_id
  const messageMap = new Map<string, string>(); // whatsapp_message_id -> our_message_id
  
  // First pass: Process message payloads to create contacts, conversations, and messages
  for (const file of payloadFiles) {
    if (!file.includes('message')) continue;
    
    console.log(`📨 Processing message file: ${file}`);
    
    const filePath = path.join(payloadsDir, file);
    const payload: WhatsAppPayload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    for (const entry of payload.metaData.entry) {
      for (const change of entry.changes) {
        const { value } = change;
        
        if (value.messages && value.contacts) {
          // Create contacts
          for (const contact of value.contacts) {
            if (!contactMap.has(contact.wa_id)) {
              console.log(`👤 Creating contact: ${contact.profile.name} (${contact.wa_id})`);
              
              const newContact = await storage.createContact({
                waId: contact.wa_id,
                name: contact.profile.name,
                phone: contact.wa_id,
                avatar: null,
                lastSeen: new Date(),
              });
              
              contactMap.set(contact.wa_id, newContact.id);
              
              // Create conversation for this contact
              console.log(`💬 Creating conversation for: ${contact.profile.name}`);
              const conversation = await storage.createConversation({
                contactId: newContact.id,
                unreadCount: 0,
              });
              
              conversationMap.set(contact.wa_id, conversation.id);
            }
          }
          
          // Process messages
          for (const message of value.messages) {
            const isFromContact = message.from !== businessPhone;
            const contactWaId = isFromContact ? message.from : value.contacts[0]?.wa_id;
            
            if (!contactWaId || !conversationMap.has(contactWaId)) {
              console.warn(`⚠️ No conversation found for message from ${message.from}`);
              continue;
            }
            
            const conversationId = conversationMap.get(contactWaId)!;
            const timestamp = new Date(parseInt(message.timestamp) * 1000);
            
            console.log(`📤 Creating message: ${message.text.body.substring(0, 50)}...`);
            
            const newMessage = await storage.createMessage({
              conversationId,
              waMessageId: message.id,
              metaMsgId: message.id,
              content: message.text.body,
              messageType: message.type,
              sender: isFromContact ? 'contact' : 'user',
              status: 'sent',
              timestamp,
            });
            
            messageMap.set(message.id, newMessage.id);
          }
        }
      }
    }
  }
  
  // Second pass: Process status payloads to update message statuses
  for (const file of payloadFiles) {
    if (!file.includes('status')) continue;
    
    console.log(`📋 Processing status file: ${file}`);
    
    const filePath = path.join(payloadsDir, file);
    const payload: WhatsAppPayload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    for (const entry of payload.metaData.entry) {
      for (const change of entry.changes) {
        const { value } = change;
        
        if (value.statuses) {
          for (const status of value.statuses) {
            const messageId = messageMap.get(status.meta_msg_id);
            
            if (messageId) {
              console.log(`🔄 Updating message status to: ${status.status}`);
              await storage.updateMessage(messageId, { status: status.status });
            } else {
              console.warn(`⚠️ Message not found for status update: ${status.meta_msg_id}`);
            }
          }
        }
      }
    }
  }
  
  console.log(`✅ WhatsApp data initialized: ${contactMap.size} contacts, ${messageMap.size} messages`);
}
