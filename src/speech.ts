// 英文播放：使用瀏覽器內建的 SpeechSynthesis，不需要 API，也不產生費用。

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'en-US' && /Samantha|Ava|Allison|Google US/i.test(v.name)) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.startsWith('en'))
  );
}

/** 播放一段或多段英文，依序念完後 resolve。 */
export function speak(texts: string | string[], rate = 0.95, onPart?: (i: number) => void): Promise<void> {
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
      u.lang = 'en-US';
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
