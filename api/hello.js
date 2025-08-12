module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ 
    message: "Hello from Vercel API!",
    working: true,
    timestamp: new Date().toISOString()
  });
};
