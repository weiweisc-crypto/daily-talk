import { describe, expect, it } from 'vitest';
import { voiceScore } from './speech';

const rank = (vs: { name: string; lang: string }[]) =>
  [...vs].filter((v) => voiceScore(v) > -50).sort((a, b) => voiceScore(b) - voiceScore(a)).map((v) => v.name);

describe('英文聲音排序', () => {
  it('高品質與進階聲音排在預設與機械聲音前面，趣味聲音與非英文排除', () => {
    const voices = [
      { name: 'Samantha', lang: 'en-US' },
      { name: 'Fred', lang: 'en-US' },
      { name: 'Zarvox', lang: 'en-US' },
      { name: 'Ava (Enhanced)', lang: 'en-US' },
      { name: 'Zoe (Premium)', lang: 'en-US' },
      { name: 'Daniel', lang: 'en-GB' },
      { name: 'Meijia', lang: 'zh-TW' },
    ];
    expect(rank(voices)).toEqual(['Zoe (Premium)', 'Ava (Enhanced)', 'Daniel', 'Samantha']);
  });
});
