export default async function handler(req, res) {
  res.json({
    message: 'Environment test endpoint',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI_SET: !!process.env.MONGODB_URI,
      MONGODB_URI_LENGTH: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV
    },
    timestamp: new Date().toISOString()
  });
}
