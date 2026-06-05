import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db, { getOrCreateConversation, addMessage, getMessages } from './db';
import { generateReply } from './llm';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Spur AI Agent backend is running');
});

app.get('/test-db', (req, res) => {
  const result = db.prepare('SELECT 1 as test').get();
  res.json(result);
});

// NEW: Get conversation history
app.get('/chat/history', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'sessionId required' });
  }
  const messages = getMessages(sessionId);
  res.json({ messages });
});

// Main chat endpoint
app.post('/chat/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const finalMessage = trimmedMessage.length > 1000 
      ? trimmedMessage.slice(0, 1000) + '...' 
      : trimmedMessage;

    const conversationId = getOrCreateConversation(sessionId);
    addMessage(conversationId, 'user', finalMessage);
    const history = getMessages(conversationId);
    const aiReply = await generateReply(history, finalMessage);
    addMessage(conversationId, 'ai', aiReply);

    res.json({ reply: aiReply, sessionId: conversationId });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:3000`);
});