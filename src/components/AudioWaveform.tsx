import React from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  speaker: 'ai' | 'customer' | 'none';
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  speaker,
  barCount = 18,
}) => {
  const getSpeakerColor = () => {
    if (speaker === 'ai') return 'bg-blue-600';
    if (speaker === 'customer') return 'bg-emerald-500';
    return 'bg-slate-300';
  };

  return (
    <div className="flex items-center gap-1 h-8 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200" id="audio-waveform-container">
      {Array.from({ length: barCount }).map((_, i) => {
        // Generate pseudo-random animated heights
        const animationDelay = `${(i * 0.08).toFixed(2)}s`;
        const heightMultiplier = isActive ? (i % 3 === 0 ? '70%' : i % 2 === 0 ? '95%' : '45%') : '15%';

        return (
          <div
            key={i}
            id={`waveform-bar-${i}`}
            className={`w-1 rounded-full transition-all duration-200 ${getSpeakerColor()} ${
              isActive ? 'animate-pulse' : 'opacity-40'
            }`}
            style={{
              height: heightMultiplier,
              animationDelay,
              minHeight: '4px',
            }}
          />
        );
      })}
    </div>
  );
};
