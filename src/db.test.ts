import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { deleteConversation, getConversation, isPersistent, listConversations, saveConversation } from './db';
import { DEMO_TURNS, buildDemoConversation } from './demoData';

describe('IndexedDB 對話紀錄', () => {
  it('可以儲存、重新開啟、依時間排序、刪除', async () => {
    const a = buildDemoConversation(DEMO_TURNS, 1000);
    const b = buildDemoConversation(DEMO_TURNS.slice(0, 2), 2000);
    await saveConversation(a);
    await saveConversation(b);
    expect(isPersistent()).toBe(true);

    const list = await listConversations();
    expect(list.map((c) => c.id)).toEqual([b.id, a.id]);

    const reopened = await getConversation(a.id);
    expect(reopened?.lines).toHaveLength(10);
    expect(reopened?.turns[9].speaker).toBe('user');

    await deleteConversation(a.id);
    expect((await listConversations()).map((c) => c.id)).toEqual([b.id]);
  });
});
