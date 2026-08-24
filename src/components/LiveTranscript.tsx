import React, { useEffect, useRef, useState } from 'react';
import { Bot, User, Copy, Check, ArrowDown, Languages } from 'lucide-react';
import { TranscriptMessage } from '../types';

interface LiveTranscriptProps {
  messages: TranscriptMessage[];
  language?: string;
  isCallLive?: boolean;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  messages,
  language,
  isCallLive,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, autoScroll]);

  const handleCopyTranscript = () => {
    const text = messages
      .map((m) => `[${m.timestamp}] ${m.speaker.toUpperCase()}: ${m.text}${m.translation ? `\n(Translation: ${m.translation})` : ''}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-[520px] shadow-xs overflow-hidden" id="live-transcript-panel">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/80 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide" id="transcript-heading">
            Live Speech Transcript
          </h3>
          <span className="text-xs px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-full font-medium" id="transcript-count">
            {messages.length} utterances
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Translation Toggle */}
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              showTranslations
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle English translations for Telugu/Hindi dialogue"
            id="btn-toggle-translations"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Translation</span>
          </button>

          {/* Copy Transcript */}
          <button
            onClick={handleCopyTranscript}
            disabled={messages.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
            title="Copy full transcript"
            id="btn-copy-transcript"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const target = e.currentTarget;
          const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 40;
          setAutoScroll(isAtBottom);
        }}
        className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40"
        id="transcript-feed"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400" id="transcript-empty-state">
            <Bot className="w-10 h-10 mb-2 opacity-40 text-blue-600" />
            <p className="text-sm font-medium text-slate-600">Waiting for call connection...</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Live speech stream will transcribe here chronologically in Telugu, Hindi, or English.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isAi = msg.speaker === 'ai';

            return (
              <div
                key={msg.id || index}
                className={`pt-3 first:pt-0 flex gap-3 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}
                id={`transcript-msg-${index}`}
              >
                {/* Speaker Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-xs ${
                    isAi
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                  title={isAi ? 'AI Voice Agent' : 'Customer Prospect'}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble Container */}
                <div className={`max-w-[84%] sm:max-w-[80%] flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                  {/* Meta Label */}
                  <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {isAi ? 'AI Sales Agent' : 'Customer'}
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono text-[10px] text-slate-400">{msg.timestamp}</span>
                    {msg.language && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-200/80 text-slate-600 rounded">
                        {msg.language}
                      </span>
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                      isAi
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        : 'bg-blue-600 text-white rounded-tr-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-normal">{msg.text}</p>

                    {/* Translation Box */}
                    {showTranslations && msg.translation && (
                      <div className={`mt-2 pt-2 border-t text-xs italic font-sans flex items-start gap-1.5 ${
                        isAi
                          ? 'border-slate-100 text-slate-500'
                          : 'border-blue-500/50 text-blue-100'
                      }`}>
                        <Languages className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isAi ? 'text-blue-600' : 'text-blue-200'}`} />
                        <span>{msg.translation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Live typing/speaking indicator */}
        {isCallLive && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic py-1 px-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>Transcribing continuous speech stream...</span>
          </div>
        )}
      </div>

      {/* Auto-scroll resume floating trigger */}
      {!autoScroll && messages.length > 0 && (
        <div className="p-2 border-t border-slate-200 bg-white text-center">
          <button
            onClick={() => {
              setAutoScroll(true);
              scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full shadow-xs"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Resume Auto-Scroll</span>
          </button>
        </div>
      )}
    </div>
  );
};
