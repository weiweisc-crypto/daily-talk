import type { Conversation } from '../types';
import { SpeakerLabel, TopBar, usePref } from '../ui';

export default function English({ conv, onBack, onPick }: { conv: Conversation; onBack: () => void; onPick: (i: number) => void }) {
  const [hideZh, setHideZh] = usePref('hideZh', false);
  const zhById = new Map(conv.turns.map((t) => [t.id, t.zh]));

  return (
    <div className="screen">
      <TopBar title="英文對話" onBack={onBack} backLabel="首頁" />
      <main className="content">
        <div className="row spread">
          <p className="muted small">點任何一句英文，開始練習。已自動儲存。</p>
          <label className="toggle">
            <input type="checkbox" checked={hideZh} onChange={(e) => setHideZh(e.target.checked)} />
            隱藏中文
          </label>
        </div>
        {conv.source === 'demo' && <p className="notice small">Demo：這段英文是事先寫好的固定內容，不是 AI 即時產生。</p>}
        {conv.lines.length === 0 && <p className="muted">這段對話沒有可以練習的句子。</p>}
        <ol className="turns">
          {conv.lines.map((l, i) => (
            <li key={l.turnId} className={`turn ${l.speaker}`}>
              <button className="line" onClick={() => onPick(i)}>
                <SpeakerLabel speaker={l.speaker} />
                <span className="en">{l.en}</span>
                {!hideZh && <span className="zh">{zhById.get(l.turnId)}</span>}
                <span className="go">練習 ›</span>
              </button>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
