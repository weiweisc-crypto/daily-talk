import { useEffect, useState } from 'react';
import type { Speaker } from './types';

export function TopBar({ title, onBack, backLabel = '返回' }: { title: string; onBack?: () => void; backLabel?: string }) {
  return (
    <header className="topbar">
      {onBack ? (
        <button className="link" onClick={onBack}>
          ‹ {backLabel}
        </button>
      ) : (
        <span />
      )}
      <h1>{title}</h1>
      <span className="badge" title="目前使用固定測試內容，沒有連線 AI">
        Demo
      </span>
    </header>
  );
}

export function SpeakerLabel({ speaker }: { speaker: Speaker }) {
  return <span className={`speaker ${speaker}`}>{speaker === 'ai' ? 'AI' : '我'}</span>;
}

/** 記住「隱藏中文」等小偏好；存不了也沒關係。 */
export function usePref(key: string, initial: boolean) {
  const [v, setV] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(key);
      return s === null ? initial : s === '1';
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [key, v]);
  return [v, setV] as const;
}
