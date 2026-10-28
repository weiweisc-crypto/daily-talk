import { useEffect, useRef, useState } from 'react';
import type { ChatTurn, Conversation } from '../types';
import { DEMO_SECONDS_PER_ANSWER, DEMO_TURNS, TARGET_USER_SECONDS, buildDemoConversation } from '../demoData';
import { saveConversation } from '../db';
import { RECORDER_ERROR_TEXT, useRecorder } from '../useRecorder';
import { SpeakerLabel, TopBar } from '../ui';

// Demo 聊天：AI 的開場與追問、你的「語音轉文字」都是固定內容。
// 錄音是真的（只留在手機上），用來計算你說了幾秒，不會被辨識或上傳。

export default function Chat({ onCancel, onFinished }: { onCancel: () => void; onFinished: (c: Conversation) => void }) {
  const [turns, setTurns] = useState<ChatTurn[]>([DEMO_TURNS[0]]);
  const [userSeconds, setUserSeconds] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  const [saving, setSaving] = useState(false);
  const rec = useRecorder();
  const endRef = useRef<HTMLDivElement>(null);

  const nextIndex = turns.length; // 下一個要出現的固定輪次
  const scriptDone = nextIndex >= DEMO_TURNS.length;
  const waitingForUser = !scriptDone && !aiThinking && DEMO_TURNS[nextIndex]?.speaker === 'user';
  const reachedTarget = userSeconds >= TARGET_USER_SECONDS;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, aiThinking]);

  const addUserAnswer = (seconds: number) => {
    const userTurn = DEMO_TURNS[nextIndex];
    setUserSeconds((s) => s + seconds);
    setTurns((t) => [...t, userTurn]);
    const aiTurn = DEMO_TURNS[nextIndex + 1];
    if (aiTurn && aiTurn.speaker === 'ai') {
      setAiThinking(true);
      window.setTimeout(() => {
        setTurns((t) => [...t, aiTurn]);
        setAiThinking(false);
      }, 900);
    }
  };

  const toggleRecord = async () => {
    if (rec.recording) {
      const r = await rec.stop();
      if (r) addUserAnswer(Math.max(1, r.seconds));
    } else {
      await rec.start();
    }
  };

  const finish = async () => {
    if (rec.recording) await rec.stop();
    if (!turns.some((t) => t.speaker === 'user')) {
      onCancel();
      return;
    }
    setSaving(true);
    const conv = buildDemoConversation(turns);
    await saveConversation(conv);
    onFinished(conv);
  };

  return (
    <div className="screen">
      <TopBar title="中文聊天" onBack={onCancel} backLabel="首頁" />
      <main className="content chat">
        <p className="notice small">Demo：AI 的問題和「你的回答文字」都是固定的測試內容，錄音只在本機計時，不會傳送出去。</p>
        <ol className="turns">
          {turns.map((t) => (
            <li key={t.id} className={`turn ${t.speaker}`}>
              <SpeakerLabel speaker={t.speaker} />
              <p>{t.zh}</p>
            </li>
          ))}
          {aiThinking && (
            <li className="turn ai thinking">
              <SpeakerLabel speaker="ai" />
              <p>…</p>
            </li>
          )}
        </ol>
        <div ref={endRef} />
      </main>

      <footer className="dock">
        <div className="progress" aria-label={`你已說了約 ${Math.round(userSeconds)} 秒`}>
          <div className="bar" style={{ width: `${Math.min(100, (userSeconds / TARGET_USER_SECONDS) * 100)}%` }} />
        </div>
        <p className="small muted center">
          你已說了約 {Math.round(userSeconds)} 秒 / 建議 {TARGET_USER_SECONDS} 秒
          {reachedTarget && '，可以結束聊天了'}
          {scriptDone && '（示範對話已全部播完）'}
        </p>
        {rec.error && <p className="error small">{RECORDER_ERROR_TEXT[rec.error]}</p>}
        <div className="row">
          <button
            className={`record ${rec.recording ? 'on' : ''}`}
            onClick={toggleRecord}
            disabled={!waitingForUser && !rec.recording}
          >
            {rec.recording ? `■ 說完了（${rec.elapsed.toFixed(0)} 秒）` : '● 點一下開始說中文'}
          </button>
        </div>
        <div className="row">
          <button className="secondary" onClick={() => addUserAnswer(DEMO_SECONDS_PER_ANSWER)} disabled={!waitingForUser || rec.recording}>
            不錄音，帶入示範回答
          </button>
          <button className={reachedTarget || scriptDone ? 'primary' : 'secondary'} onClick={finish} disabled={saving}>
            {saving ? '整理中…' : '結束聊天'}
          </button>
        </div>
      </footer>
    </div>
  );
}
