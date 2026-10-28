// 每一輪對話都用結構化資料保存，英文重建時用 turnId 對回原本的中文與說話者，避免角色錯置。

export type Speaker = 'ai' | 'user';

export interface ChatTurn {
  id: string;
  speaker: Speaker;
  zh: string;
}

export interface SimpleVersion {
  en: string;
  /** true 表示簡化後語意比原句概括，畫面必須標示 */
  generalized: boolean;
  /** 概括時說明少了什麼 */
  note?: string;
}

export interface EnglishLine {
  turnId: string;
  speaker: Speaker;
  en: string;
  /** 有意義的語塊；串起來就是完整英文 */
  chunks: string[];
  simple: SimpleVersion;
}

export interface Conversation {
  id: string;
  createdAt: number;
  title: string;
  source: 'demo' | 'ai';
  turns: ChatTurn[];
  lines: EnglishLine[];
}
