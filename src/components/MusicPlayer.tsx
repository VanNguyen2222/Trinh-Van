'use client';
import { useState, useRef, useEffect } from 'react';

export default function MusicPlayer({ src, isPlaying, setIsPlaying }: { src: string; isPlaying: boolean; setIsPlaying: (val: boolean) => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => console.log('Autoplay blocked:', err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        type="button"
        onClick={togglePlay}
        aria-label="Bật tắt nhạc"
        className="fixed right-4 bottom-4 z-40 flex size-11 items-center justify-center rounded-full bg-[#B49A7E] text-[#FBF8F2] shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        <span className={`text-lg leading-none ${isPlaying ? 'animate-spin' : ''}`}>♪</span>
      </button>
    </>
  );
}
