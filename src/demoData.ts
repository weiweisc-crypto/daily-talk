import type { ChatTurn, Conversation, EnglishLine } from './types';

// 階段 A 的固定測試對話。這裡沒有連線任何 AI，畫面上也會標示「Demo」。

export const OPENING_QUESTIONS = [
  '你剛剛在忙什麼？',
  '你今天過得怎麼樣？',
  '你最近有什麼煩惱嗎？',
  '你晚餐吃了什麼？',
];

export const DEMO_TURNS: ChatTurn[] = [
  { id: 't1', speaker: 'ai', zh: '你剛剛在忙什麼？' },
  { id: 't2', speaker: 'user', zh: '我剛剛在忙管委會的事情。' },
  { id: 't3', speaker: 'ai', zh: '你們最近在忙什麼？' },
  { id: 't4', speaker: 'user', zh: '最近在討論大樓電梯要更換的問題。' },
  { id: 't5', speaker: 'ai', zh: '那應該要花不少錢吧？' },
  { id: 't6', speaker: 'user', zh: '對，大概一百五十萬左右。' },
  { id: 't7', speaker: 'ai', zh: '有廠商在評估嗎？' },
  { id: 't8', speaker: 'user', zh: '我不知道，管委會有一個五人小組負責，他們貼公告給住戶看。' },
  { id: 't9', speaker: 'ai', zh: '所以你們也要參與決定嗎？' },
  { id: 't10', speaker: 'user', zh: '我們是住戶，他們需要經過我們授權，才能正式確定方案。' },
];

/** Demo 模式每次「說話」記為幾秒（沒有麥克風時使用） */
export const DEMO_SECONDS_PER_ANSWER = 3;
export const TARGET_USER_SECONDS = 15;

// 注意：
// - 「一百五十萬」原文沒有貨幣單位，英文也不加 dollars / NT$。
// - 「那應該要花不少錢吧？」是 AI 的猜測，英文保留為疑問。
// - 最後一句只說「需要授權」，不代表住戶已經同意。
export const DEMO_LINES: EnglishLine[] = [
  {
    turnId: 't1',
    speaker: 'ai',
    en: 'What were you up to just now?',
    chunks: ['What were you up to', 'just now?'],
    simple: { en: 'What were you doing?', generalized: false },
  },
  {
    turnId: 't2',
    speaker: 'user',
    en: 'I was dealing with some building management committee stuff.',
    chunks: ['I was dealing with', 'some building management', 'committee stuff.'],
    simple: { en: 'I was busy with building committee work.', generalized: false },
  },
  {
    turnId: 't3',
    speaker: 'ai',
    en: 'What have you all been working on lately?',
    chunks: ['What have you all', 'been working on', 'lately?'],
    simple: { en: 'What are you working on these days?', generalized: false },
  },
  {
    turnId: 't4',
    speaker: 'user',
    en: "Lately we've been discussing replacing the elevator in our building.",
    chunks: ["Lately we've been discussing", 'replacing the elevator', 'in our building.'],
    simple: {
      en: "We're talking about the elevator.",
      generalized: true,
      note: '沒有說出「更換」電梯',
    },
  },
  {
    turnId: 't5',
    speaker: 'ai',
    en: "That's probably going to cost a lot, isn't it?",
    chunks: ["That's probably going to", 'cost a lot,', "isn't it?"],
    simple: { en: 'That sounds expensive, right?', generalized: false },
  },
  {
    turnId: 't6',
    speaker: 'user',
    en: 'Yeah, around one point five million.',
    chunks: ['Yeah,', 'around one point five million.'],
    simple: { en: 'Yes, about 1.5 million.', generalized: false },
  },
  {
    turnId: 't7',
    speaker: 'ai',
    en: 'Are any contractors looking into it?',
    chunks: ['Are any contractors', 'looking into it?'],
    simple: { en: 'Is a company checking it?', generalized: false },
  },
  {
    turnId: 't8',
    speaker: 'user',
    en: "I'm not sure. The committee has a five-person team in charge of it, and they put up notices for the residents.",
    chunks: [
      "I'm not sure.",
      'The committee has',
      'a five-person team',
      'in charge of it,',
      'and they put up notices',
      'for the residents.',
    ],
    simple: {
      en: "I don't know. Five people handle it. They post notices for us.",
      generalized: false,
    },
  },
  {
    turnId: 't9',
    speaker: 'ai',
    en: 'So do you all get a say in the decision too?',
    chunks: ['So do you all', 'get a say', 'in the decision too?'],
    simple: { en: 'So do you help decide?', generalized: false },
  },
  {
    turnId: 't10',
    speaker: 'user',
    en: "We're the residents, so they need our authorization before they can make the plan official.",
    chunks: ["We're the residents,", 'so they need our authorization', 'before they can', 'make the plan official.'],
    simple: {
      en: 'They need our approval first.',
      generalized: true,
      note: '省略了「我們是住戶」與「正式確定方案」',
    },
  },
];

/** 依照目前已完成的對話輪次，產生英文對話（Demo：取固定內容，不呼叫 AI）。 */
export function buildDemoConversation(turns: ChatTurn[], now = Date.now()): Conversation {
  const ids = new Set(turns.map((t) => t.id));
  const lines = DEMO_LINES.filter((l) => ids.has(l.turnId));
  const firstUser = turns.find((t) => t.speaker === 'user');
  return {
    id: `c${now}`,
    createdAt: now,
    title: firstUser ? firstUser.zh.slice(0, 18) : '（沒有內容的對話）',
    source: 'demo',
    turns: [...turns],
    lines,
  };
}
