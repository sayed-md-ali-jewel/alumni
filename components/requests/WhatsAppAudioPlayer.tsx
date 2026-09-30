'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';

interface WhatsAppAudioPlayerProps {
  audioUrl: string;
  isSender?: boolean;
}

export function WhatsAppAudioPlayer({ audioUrl, isSender = false }: WhatsAppAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoaded(true);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audio) audio.currentTime = 0;
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [audioUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.error('Audio playback error:', err));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newFraction = Math.max(0, Math.min(1, clickX / width));
    audio.currentTime = newFraction * duration;
    setCurrentTime(audio.currentTime);
  };

  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    const rates = [1, 1.5, 2];
    const nextRateIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextRateIndex];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Generate 24 static bar heights to form a realistic voice wave
  const barHeights = [
    30, 45, 70, 90, 60, 40, 80, 100, 75, 50, 65, 85, 95, 70, 40, 60, 85, 55, 75, 90, 65, 45, 35, 25,
  ];

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 py-1 min-w-[200px] max-w-[280px] select-none">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play / Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm ${
          isSender
            ? 'bg-white/20 text-white hover:bg-white/30'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500'
        }`}
        aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
        ) : (
          <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current translate-x-0.5" />
        )}
      </button>

      {/* Waveform & Scrubber */}
      <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
        <div
          onClick={handleSeek}
          className="relative h-6 flex items-center gap-[2px] cursor-pointer py-1 group"
          title="Seek audio"
        >
          {barHeights.map((h, i) => {
            const barProgress = (i / barHeights.length) * 100;
            const isPlayed = progress >= barProgress;
            return (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={`w-[2.5px] rounded-full transition-all duration-75 ${
                  isPlayed
                    ? isSender
                      ? 'bg-white'
                      : 'bg-emerald-600 dark:bg-emerald-400'
                    : isSender
                    ? 'bg-white/40'
                    : 'bg-slate-300 dark:bg-slate-600'
                } group-hover:opacity-90`}
              />
            );
          })}
        </div>

        {/* Time and Speed Control */}
        <div className="flex items-center justify-between text-[10px] font-medium leading-none">
          <span className={isSender ? 'text-white/85 dark:text-[#aebac1]' : 'text-slate-500 dark:text-[#8696a0]'}>
            {isPlaying || currentTime > 0
              ? `${formatTime(currentTime)} / ${formatTime(duration)}`
              : formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={toggleSpeed}
            className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-colors ${
              isSender
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
            }`}
            title="Change playback speed"
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Mic Badge */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
          isSender ? 'text-white/75 dark:text-[#aebac1]' : 'text-emerald-600 dark:text-emerald-400'
        }`}
      >
        <Mic className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
