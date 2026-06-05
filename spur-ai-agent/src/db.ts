import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';

const db = new Database(path.join(__dirname, '../spur.db'));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender TEXT CHECK(sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );
`);

export function getOrCreateConversation(conversationId?: string): string {
  if (conversationId) {
    const exists = db.prepare('SELECT id FROM conversations WHERE id = ?').get(conversationId);
    if (exists) return conversationId;
  }
  const newId = randomUUID();
  db.prepare('INSERT INTO conversations (id) VALUES (?)').run(newId);
  return newId;
}

export function addMessage(conversationId: string, sender: 'user' | 'ai', text: string) {
  const id = randomUUID();
  db.prepare('INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, ?, ?)')
    .run(id, conversationId, sender, text);
}

export type MessageRow = {
  sender: string;
  text: string;
  timestamp: string;
};

export function getMessages(conversationId: string): MessageRow[] {
  const stmt = db.prepare('SELECT sender, text, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC');
  return stmt.all(conversationId) as MessageRow[];
}

export default db;