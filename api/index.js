// Simple API endpoint for Vercel
export default async function handler(req, res) {
  console.log('Health check API called');
  console.log('Environment check:', {
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
  });
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    message: 'WhatsApp Clone API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabase: !!process.env.MONGODB_URI
  });
};
