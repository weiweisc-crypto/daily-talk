import { openDB, type IDBPDatabase } from 'idb';
import type { Conversation } from './types';

// 對話紀錄只存在這台裝置的瀏覽器（IndexedDB）。
// 若瀏覽器不允許 IndexedDB（例如部分私密瀏覽或內嵌預覽），改存在記憶體，並讓畫面提示使用者。

const DB_NAME = 'speaking-lab';
const STORE = 'conversations';

let dbPromise: Promise<IDBPDatabase> | null = null;
const memory = new Map<string, Conversation>();
let persistent = true;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

async function withDB<T>(fn: (db: IDBPDatabase) => Promise<T>, fallback: () => T): Promise<T> {
  if (persistent) {
    try {
      return await fn(await getDB());
    } catch {
      persistent = false;
    }
  }
  return fallback();
}

export function isPersistent() {
  return persistent;
}

export async function saveConversation(c: Conversation) {
  memory.set(c.id, c);
  await withDB(
    (db) => db.put(STORE, c),
    () => undefined,
  );
}

export async function listConversations(): Promise<Conversation[]> {
  const all = await withDB<Conversation[]>(
    (db) => db.getAll(STORE),
    () => [...memory.values()],
  );
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  return withDB<Conversation | undefined>(
    (db) => db.get(STORE, id),
    () => memory.get(id),
  );
}

export async function deleteConversation(id: string) {
  memory.delete(id);
  await withDB(
    (db) => db.delete(STORE, id),
    () => undefined,
  );
}
