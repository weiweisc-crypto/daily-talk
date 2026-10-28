import { describe, expect, it } from 'vitest';
import { DEMO_LINES, DEMO_TURNS, buildDemoConversation } from './demoData';

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

describe('固定測試對話的英文重建', () => {
  it('每一輪都有英文，且順序與說話者和中文完全一致', () => {
    expect(DEMO_LINES.map((l) => l.turnId)).toEqual(DEMO_TURNS.map((t) => t.id));
    DEMO_LINES.forEach((l, i) => expect(l.speaker).toBe(DEMO_TURNS[i].speaker));
  });

  it('AI 與使用者輪流說話，AI 開場', () => {
    DEMO_TURNS.forEach((t, i) => expect(t.speaker).toBe(i % 2 === 0 ? 'ai' : 'user'));
  });

  it('不擅自加入貨幣單位', () => {
    const all = DEMO_LINES.flatMap((l) => [l.en, l.simple.en]).join(' ');
    expect(all).not.toMatch(/\$|\bNT\b|dollar|yuan|\bTWD\b|元|currency/i);
    expect(DEMO_LINES.find((l) => l.turnId === 't6')!.en).toMatch(/one point five million/);
  });

  it('不假設住戶已經同意', () => {
    const last = DEMO_LINES.find((l) => l.turnId === 't10')!;
    expect(last.en).toMatch(/need our authorization before/);
    const all = DEMO_LINES.flatMap((l) => [l.en, l.simple.en]).join(' ');
    expect(all).not.toMatch(/\b(we|residents) (have |already )?(agreed|approved|authorized)\b/i);
  });

  it('AI 的猜測保留為疑問', () => {
    expect(DEMO_LINES.find((l) => l.turnId === 't5')!.en.trim().endsWith('?')).toBe(true);
    DEMO_LINES.filter((l) => l.speaker === 'ai').forEach((l) => expect(l.en.trim().endsWith('?')).toBe(true));
  });

  it('保留五人小組與公告的細節', () => {
    const t8 = DEMO_LINES.find((l) => l.turnId === 't8')!;
    expect(t8.en).toMatch(/five-person team/);
    expect(t8.en).toMatch(/notices/);
  });

  it('語塊串起來就是完整句子，且不是拆成單字', () => {
    DEMO_LINES.forEach((l) => {
      expect(norm(l.chunks.join(' '))).toBe(norm(l.en));
      const words = l.en.split(/\s+/).length;
      if (words > 4) expect(l.chunks.length).toBeLessThan(words);
    });
  });

  it('簡化後較概括的句子都有標示說明', () => {
    DEMO_LINES.forEach((l) => {
      if (l.simple.generalized) expect(l.simple.note).toBeTruthy();
      expect(l.simple.en).not.toBe(l.en);
    });
  });

  it('提早結束聊天時，只重建已說過的輪次', () => {
    const c = buildDemoConversation(DEMO_TURNS.slice(0, 4), 1);
    expect(c.lines.map((l) => l.turnId)).toEqual(['t1', 't2', 't3', 't4']);
    expect(c.title).toBe('我剛剛在忙管委會的事情。');
    expect(c.source).toBe('demo');
  });
});
