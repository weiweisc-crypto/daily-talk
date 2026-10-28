import { useCallback, useEffect, useRef, useState } from 'react';

// 用 MediaRecorder 錄音。錄音只留在這次開啟的頁面（記憶體），不會上傳、不會永久保存。

export type RecorderError = 'unsupported' | 'denied' | 'no-device' | 'failed';

export const RECORDER_ERROR_TEXT: Record<RecorderError, string> = {
  unsupported: '這個瀏覽器不支援錄音。請用 iPhone 的 Safari 開啟，或改用下方的示範按鈕。',
  denied: '沒有取得麥克風權限。請到「設定 > Safari > 麥克風」允許，或按網址列左側「大小」圖示開啟權限後再試。',
  'no-device': '找不到麥克風。',
  failed: '錄音沒有成功，請再試一次。',
};

export interface Recording {
  url: string;
  seconds: number;
}

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return undefined;
  return ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find((t) => MediaRecorder.isTypeSupported(t));
}

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<RecorderError | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);
  const resolveRef = useRef<((r: Recording | null) => void) | null>(null);
  const urlsRef = useRef<string[]>([]);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    window.clearInterval(timerRef.current);
  };

  useEffect(
    () => () => {
      cleanupStream();
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('unsupported');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        const seconds = (Date.now() - startRef.current) / 1000;
        cleanupStream();
        setRecording(false);
        const blob = new Blob(chunks, { type: rec.mimeType || mimeType || 'audio/mp4' });
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        resolveRef.current?.(blob.size ? { url, seconds } : null);
        resolveRef.current = null;
      };
      recRef.current = rec;
      startRef.current = Date.now();
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 200);
      rec.start();
      setRecording(true);
      return true;
    } catch (e) {
      cleanupStream();
      const name = (e as DOMException)?.name;
      setError(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : name === 'NotFoundError' ? 'no-device' : 'failed');
      return false;
    }
  }, []);

  /** 停止錄音並取得這次的錄音（只在記憶體中） */
  const stop = useCallback(
    () =>
      new Promise<Recording | null>((resolve) => {
        const rec = recRef.current;
        if (!rec || rec.state === 'inactive') return resolve(null);
        resolveRef.current = resolve;
        rec.stop();
      }),
    [],
  );

  return { recording, elapsed, error, start, stop, clearError: () => setError(null) };
}
