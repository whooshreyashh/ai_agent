import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateReply(conversationHistory: { sender: string; text: string }[], userMessage: string): Promise<string> {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY not set');
    return "I'm having configuration issues. Please check the API key.";
  }

  const groq = new Groq({ apiKey: GROQ_API_KEY });

  // Build messages array
  const messages: Message[] = [
    {
      role: 'system',
      content: `You are a helpful customer support agent for a small e-commerce store called "SpurShop".
      
Store policies:
- Shipping: Free shipping on orders over $50. Standard shipping takes 3-5 business days. Express shipping (1-2 business days) costs $10.
- Returns: 30-day return policy. Items must be unused and in original packaging. Customer pays return shipping unless item is defective.
- Refunds: Processed within 5-7 business days after we receive the return.
- Support hours: Monday-Friday, 9 AM to 6 PM EST.

Answer questions clearly and concisely. Be friendly and helpful. Never make up policies. If asked something outside these policies, say you'll check with a human agent.`
    }
  ];

  // Add conversation history (last 6 messages to save tokens)
  const recentHistory = conversationHistory.slice(-6);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage
  });

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // The updated, supported model name
      messages: messages,
      max_tokens: 300,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error('Groq API error:', error.message);
    
    if (error.message?.includes('rate limit')) {
      return "I'm getting too many requests. Please wait a moment and try again.";
    } else if (error.message?.includes('timeout')) {
      return "The request timed out. Please try again.";
    } else {
      return "Sorry, I'm having trouble connecting to my AI brain. Please try again later.";
    }
  }
}