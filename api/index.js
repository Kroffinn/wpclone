// Simple API endpoint for Vercel
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json({ 
      status: 'ok', 
      message: 'WhatsApp Clone API is running',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
