import { useEffect, useState } from 'react';
import { canSpeak, englishVoices, getPreferredVoiceURI, setPreferredVoiceURI, speak } from './speech';

// 讓使用者自己挑聲音。聲音清單是瀏覽器慢慢載入的，所以要等 voiceschanged。

export default function VoicePicker() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => englishVoices());
  const [uri, setUri] = useState<string>(() => getPreferredVoiceURI() || '');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!canSpeak()) return;
    const update = () => setVoices(englishVoices());
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);

  if (!canSpeak() || voices.length === 0) return null;
  const current = voices.find((v) => v.voiceURI === uri) || voices[0];
  const hasEnhanced = voices.some((v) => /Premium|Enhanced|Natural|Neural/i.test(v.name));

  return (
    <div className="voice-picker">
      <label className="small muted" htmlFor="voice">
        英文聲音
      </label>
      <div className="row">
        <select
          id="voice"
          value={current.voiceURI}
          onChange={(e) => {
            setUri(e.target.value);
            setPreferredVoiceURI(e.target.value);
            speak('Hi, this is how I sound.');
          }}
        >
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name}（{v.lang}）
            </option>
          ))}
        </select>
        <button className="link small" onClick={() => setShowHelp(!showHelp)}>
          {showHelp ? '收起' : '聲音不自然？'}
        </button>
      </div>
      {(showHelp || !hasEnhanced) && (
        <p className="small notice">
          {!hasEnhanced && '這支手機目前沒有安裝高品質英文聲音。'}
          iPhone 可以免費下載更自然的聲音：打開「設定 → 輔助使用 → 朗讀內容 → 聲音 → 英文」，選名稱有「進階」或「高品質」的聲音（例如 Ava、Zoe、Evan）下載。下載完重新開啟這個頁面，就能在上面選到。
        </p>
      )}
    </div>
  );
}
