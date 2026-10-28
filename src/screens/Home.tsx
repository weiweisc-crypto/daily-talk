import { useEffect, useState } from 'react';
import type { Conversation } from '../types';
import { deleteConversation, isPersistent, listConversations } from '../db';
import { TopBar } from '../ui';

export default function Home({ onStart, onOpen }: { onStart: () => void; onOpen: (c: Conversation) => void }) {
  const [items, setItems] = useState<Conversation[] | null>(null);

  const refresh = () => listConversations().then(setItems);
  useEffect(() => {
    refresh();
  }, []);

  const remove = async (c: Conversation) => {
    if (!window.confirm(`確定要刪除「${c.title}」嗎？刪除後無法復原。`)) return;
    await deleteConversation(c.id);
    refresh();
  };

  return (
    <div className="screen">
      <TopBar title="生活英文口說實驗室" />
      <main className="content">
        <section className="hero">
          <p className="lead">用你今天真正想說的話，練習自然的英文。</p>
          <p className="muted">先用中文聊幾句，系統把對話整理成英文，你再挑想練的句子開口說。不評分，照你的步調。</p>
          <button className="primary big" onClick={onStart}>
            開始聊天
          </button>
          <p className="notice">
            目前是 <b>Demo 模式</b>：使用固定的測試對話，<b>沒有連線 AI</b>，錄音也不會上傳。
          </p>
        </section>

        <section>
          <h2>歷史紀錄</h2>
          {items === null ? (
            <p className="muted">載入中…</p>
          ) : items.length === 0 ? (
            <p className="muted">還沒有紀錄。聊完一次後會自動儲存在這裡。</p>
          ) : (
            <ul className="history">
              {items.map((c) => (
                <li key={c.id}>
                  <button className="history-open" onClick={() => onOpen(c)}>
                    <span className="history-title">{c.title}</span>
                    <span className="muted small">
                      {new Date(c.createdAt).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' })} ·{' '}
                      {c.lines.length} 句{c.source === 'demo' ? ' · Demo' : ''}
                    </span>
                  </button>
                  <button className="danger-link" onClick={() => remove(c)} aria-label={`刪除 ${c.title}`}>
                    刪除
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="notice small">
            紀錄只存在這台裝置的瀏覽器裡，沒有雲端備份。清除 Safari 的「網站資料」或「歷史紀錄與網站資料」可能會讓紀錄消失。
            {!isPersistent() && <b> 目前這個瀏覽器不允許長期儲存，紀錄在關閉頁面後就會消失。</b>}
          </p>
        </section>
      </main>
    </div>
  );
}
