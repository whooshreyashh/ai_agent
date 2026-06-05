# Spur AI Agent – take‑home assignment

Hey, this is my submission for the Founding Full‑Stack Engineer role at Spur.  
It's a mini AI support agent that you can chat with – remembers conversation history, uses Groq (free LLM), and keeps messages in a local SQLite DB.

## What I built

- A chat widget (React + Tailwind) that feels like a real customer support tool.
- Backend in Node.js + TypeScript that saves every message and calls an LLM.
- The AI answers questions about a fictional store's policies (returns, shipping, refunds).
- Conversations survive page refresh because the session ID is stored in localStorage and messages are fetched from the DB.

## Tech stack (my choices)

- Backend: Node.js, Express, TypeScript, better‑sqlite3, Groq SDK (free, no OpenAI costs)
- Frontend: React (Create React App), Tailwind CSS, Axios
- Why Groq? OpenAI wanted money – Groq gives a free tier with Llama 3.1, fast enough.

## How to run it locally (step by step)

### Prerequisites
- Node.js (v18 or higher)
- Git (optional)
- A Groq API key (get one at https://console.groq.com – free)

### Backend setup

1. Clone the repo (or unzip the folder).
2. Navigate into the backend folder:
   ```bash
   cd spur-ai-agent



Install dependencies:

bash
npm install
Create a .env file in this folder and add:

text
GROQ_API_KEY=your-key-here
Build and start the server:

bash
npx tsc
node dist/index.js
You should see Server running on http://localhost:3000.

Frontend setup
Open another terminal, go to the frontend folder:

bash
cd frontend
Install dependencies:

bash
npm install
Start the React app:

bash
npm start
It’ll ask for a different port (say Yes) – normally runs on http://localhost:3001.

Open that URL in your browser. Type a message – the AI should reply.

If you get CORS errors, check that the backend is running first.


DATABASE//
SQLite file spur.db is created automatically. No manual migrations needed.
Two tables: conversations and messages. The backend stores every user and AI message.


ARCHITECTURE
src/index.ts – Express server, defines routes (POST /chat/message, GET /chat/history)

src/db.ts – SQLite setup and CRUD helpers

src/llm.ts – Calls Groq API with conversation history and store policies

frontend/src/App.tsx – Chat UI, sends requests, saves sessionId to localStorage

The LLM prompt includes a system message with shipping/return/refund rules, plus the last 6 messages for context.