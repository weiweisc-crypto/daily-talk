// 英文播放：使用瀏覽器內建的 SpeechSynthesis，不需要 API，也不產生費用。
// 同一支 iPhone 上有很多聲音，品質差很多：舊式和趣味聲音很機械，
// 「進階 Enhanced」「高品質 Premium」聲音自然很多，所以依品質排序挑選。

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// macOS / iOS 的趣味聲音與舊式 Eloquence 聲音，聽起來最機械，排除掉
const NOVELTY =
  /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Kathy|Ralph|Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley)\b/i;
const GOOD_NAMES = /\b(Ava|Zoe|Evan|Nathan|Allison|Susan|Tom|Noelle|Joelle|Nicky|Aaron|Serena|Daniel|Karen|Google US English)\b/i;

export function voiceScore(v: Pick<SpeechSynthesisVoice, 'name' | 'lang'>): number {
  if (!/^en[-_]/i.test(v.lang) && v.lang.toLowerCase() !== 'en') return -100;
  if (NOVELTY.test(v.name)) return -50;
  let s = 0;
  if (/Premium/i.test(v.name)) s += 6;
  if (/Enhanced/i.test(v.name)) s += 4;
  if (/Natural|Neural/i.test(v.name)) s += 5; // Edge / Windows 的自然聲音
  if (GOOD_NAMES.test(v.name)) s += 2;
  if (/Samantha/i.test(v.name)) s -= 1; // iOS 預設聲音，偏機械
  if (/^en[-_]US$/i.test(v.lang)) s += 1;
  return s;
}

/** 這台裝置上可用的英文聲音，品質好的排前面 */
export function englishVoices(): SpeechSynthesisVoice[] {
  if (!canSpeak()) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => voiceScore(v) > -50)
    .sort((a, b) => voiceScore(b) - voiceScore(a));
}

const VOICE_KEY = 'voiceURI';

export function getPreferredVoiceURI(): string | null {
  try {
    return localStorage.getItem(VOICE_KEY);
  } catch {
    return null;
  }
}

export function setPreferredVoiceURI(uri: string) {
  try {
    localStorage.setItem(VOICE_KEY, uri);
  } catch {
    /* ignore */
  }
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = englishVoices();
  const chosen = getPreferredVoiceURI();
  return voices.find((v) => v.voiceURI === chosen) || voices[0];
}

/** 播放一段或多段英文，依序念完後 resolve。 */
export function speak(texts: string | string[], rate = 1, onPart?: (i: number) => void): Promise<void> {
  if (!canSpeak()) return Promise.reject(new Error('no-speech'));
  const parts = Array.isArray(texts) ? texts : [texts];
  const synth = window.speechSynthesis;
  synth.cancel();
  const voice = pickVoice();
  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (i >= parts.length) {
        onPart?.(-1);
        resolve();
        return;
      }
      const u = new SpeechSynthesisUtterance(parts[i]);
      u.lang = voice?.lang || 'en-US';
      u.rate = rate;
      if (voice) u.voice = voice;
      onPart?.(i);
      u.onend = () => {
        i += 1;
        // 語塊之間留一點停頓
        setTimeout(next, parts.length > 1 ? 350 : 0);
      };
      u.onerror = () => {
        onPart?.(-1);
        resolve();
      };
      synth.speak(u);
    };
    next();
  });
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
