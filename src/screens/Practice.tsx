import { useEffect, useState } from 'react';
import type { Conversation } from '../types';
import { canSpeak, speak, stopSpeaking } from '../speech';
import { RECORDER_ERROR_TEXT, useRecorder, type Recording } from '../useRecorder';
import { SpeakerLabel, TopBar, usePref } from '../ui';

type Mode = 'full' | 'chunks' | 'simple';
const MODES: { id: Mode; label: string }[] = [
  { id: 'full', label: '整句' },
  { id: 'chunks', label: '分段' },
  { id: 'simple', label: '簡單說' },
];

export default function Practice({
  conv,
  index,
  onNext,
  onExit,
}: {
  conv: Conversation;
  index: number;
  onNext: () => void;
  onExit: () => void;
}) {
  const line = conv.lines[index];
  const zh = conv.turns.find((t) => t.id === line.turnId)?.zh ?? '';
  const isLast = index >= conv.lines.length - 1;

  const [mode, setMode] = useState<Mode>('full');
  const [hideZh, setHideZh] = usePref('practiceHideZh', false);
  const [slow, setSlow] = usePref('slow', false);
  const [playingPart, setPlayingPart] = useState(-1);
  const [mine, setMine] = useState<Recording | null>(null);
  const rec = useRecorder();

  useEffect(() => () => stopSpeaking(), []);

  const rate = slow ? 0.7 : 0.95;
  const target = mode === 'simple' ? line.simple.en : line.en;

  const play = (texts: string | string[]) => speak(texts, rate, setPlayingPart).catch(() => setPlayingPart(-1));

  const toggleRecord = async () => {
    stopSpeaking();
    if (rec.recording) {
      const r = await rec.stop();
      if (r) setMine(r);
    } else {
      setMine(null);
      await rec.start();
    }
  };

  const again = () => {
    stopSpeaking();
    setMine(null);
    rec.clearError();
  };

  return (
    <div className="screen">
      <TopBar title={`練習 ${index + 1} / ${conv.lines.length}`} onBack={onExit} backLabel="對話" />
      <main className="content practice">
        <div className="tabs" role="tablist">
          {MODES.map((m) => (
            <button key={m.id} role="tab" aria-selected={mode === m.id} className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>

        <section className="card">
          <SpeakerLabel speaker={line.speaker} />
          {mode === 'chunks' ? (
            <ol className="chunks">
              {line.chunks.map((c, i) => (
                <li key={i}>
                  <button className={playingPart === i ? 'chunk on' : 'chunk'} onClick={() => play(c)}>
                    <span>{c}</span>
                    <span className="icon">▶</span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="sentence">{target}</p>
          )}

          {mode === 'simple' && (
            <div className="simple-meta">
              {line.simple.generalized ? (
                <p className="tag warn">意思較概括：{line.simple.note ?? '比原句少了一些細節'}</p>
              ) : (
                <p className="tag">保留原意的簡單說法</p>
              )}
              <p className="small muted">原句：{line.en}</p>
            </div>
          )}

          <div className="row spread">
            {!hideZh ? <p className="zh">{zh}</p> : <p className="muted small">（中文已隱藏）</p>}
            <button className="link small" onClick={() => setHideZh(!hideZh)}>
              {hideZh ? '顯示中文' : '隱藏中文'}
            </button>
          </div>
        </section>

        {!canSpeak() && <p className="error small">這個瀏覽器不支援英文語音播放。</p>}
        {rec.error && <p className="error small">{RECORDER_ERROR_TEXT[rec.error]}</p>}

        <section className="controls">
          <div className="row">
            <button className="primary" onClick={() => play(mode === 'chunks' ? line.chunks : target)} disabled={rec.recording}>
              ▶ {mode === 'chunks' ? '依序播放語塊' : '播放英文'}
            </button>
            <label className="toggle">
              <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} />
              慢速
            </label>
          </div>

          <button className={`record ${rec.recording ? 'on' : ''}`} onClick={toggleRecord}>
            {rec.recording ? `■ 停止錄音（${rec.elapsed.toFixed(0)} 秒）` : mine ? '● 重新錄一次' : '● 錄下我說的'}
          </button>

          {mine && (
            <div className="compare">
              <p className="small muted">聽聽看自己的聲音，和示範比一比。說得不完整也沒關係。</p>
              <audio src={mine.url} controls playsInline />
              <button className="secondary" onClick={() => play(mode === 'chunks' ? line.chunks : target)}>
                ▶ 再聽一次示範
              </button>
            </div>
          )}

          <div className="row">
            <button className="secondary" onClick={again}>
              再練一次
            </button>
            <button className="secondary" onClick={onNext} disabled={isLast}>
              {isLast ? '已是最後一句' : '下一句'}
            </button>
            <button className="secondary" onClick={onExit}>
              結束練習
            </button>
          </div>
          <p className="small muted center">練習錄音只在這個頁面使用，離開後就不會保留。</p>
        </section>
      </main>
    </div>
  );
}
