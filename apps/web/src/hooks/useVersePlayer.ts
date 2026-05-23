import { useEffect, useRef, useState } from 'react';
import { VersePlayer, type VersePosition } from '@gt-quranreader/core';

interface Options {
  reciterId: string;
  autoNextVerse: boolean;
  autoNextSurah: boolean;
}

// نسخة الويب لا تحتاج resolve محلي — Workbox cache يعمل تلقائياً.
export function useVersePlayer(opts: Options) {
  const playerRef = useRef<VersePlayer | null>(null);
  const [activeVerse, setActiveVerse] = useState<VersePosition | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const player = new VersePlayer(
      {
        reciterId: opts.reciterId,
        autoNextVerse: opts.autoNextVerse,
        autoNextSurah: opts.autoNextSurah,
      },
      {
        onVerseChange: (pos) => setActiveVerse(pos),
        onPlayStateChange: (p) => setIsPlaying(p),
        onError: (err) => setError(err),
        onEnd: () => setActiveVerse(null),
      }
    );
    playerRef.current = player;
    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, [opts.reciterId]);

  useEffect(() => {
    playerRef.current?.setAutoNext(opts.autoNextVerse, opts.autoNextSurah);
  }, [opts.autoNextVerse, opts.autoNextSurah]);

  // الإيقاف التام: ينهي الصوت ويُعيد التطبيق إلى وضع "لا قراءة جارية".
  const stop = () => {
    playerRef.current?.stop();
    setActiveVerse(null);
    setIsPlaying(false);
    setError(null);
  };

  return {
    activeVerse,
    isPlaying,
    error,
    play: (surah: number, ayah: number) => playerRef.current?.playVerse(surah, ayah),
    pause: () => playerRef.current?.pause(),
    resume: () => playerRef.current?.resume(),
    stop,
  };
}
