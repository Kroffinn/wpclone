# WhatsApp Clone

A real-time chat application built with React, Express, Socket.IO, TypeScript, and MongoDB.

## Features

- ✅ Real-time messaging with Socket.IO
- ✅ MongoDB Atlas integration
- ✅ WhatsApp-like UI design
- ✅ Message status tracking
- ✅ Webhook support for WhatsApp Business API
- ✅ Responsive design
- ✅ TypeScript support

## Deployment

### Vercel Deployment

1. **Fork/Clone this repository**

2. **Set up MongoDB Atlas:**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string

3. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

4. **Add Environment Variables in Vercel Dashboard:**
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: production

5. **Deploy:**
   ```bash
   vercel --prod
   ```

### Environment Variables

- `MONGODB_URI`: MongoDB Atlas connection string
- `NODE_ENV`: Environment (production/development)
- `PORT`: Server port (default: 5000)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run check
```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express, Socket.IO, Node.js
- **Database**: MongoDB Atlas
- **Deployment**: Vercel
- **UI Components**: Radix UI, Shadcn/ui

## License

MIT
