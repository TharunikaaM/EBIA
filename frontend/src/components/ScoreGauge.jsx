import React, { useEffect, useState } from 'react';

const ScoreGauge = ({ score = 0 }) => {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 70;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const halfCirc = circumference / 2; 
  const offset = halfCirc - (animated / 100) * halfCirc;

  const getColor = (s) => {
    if (s >= 80) return '#10b981'; // emerald
    if (s >= 60) return '#3b82f6'; // blue
    if (s >= 40) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };
  const color = getColor(animated);

  const getLabel = (s) => {
    if (s >= 80) return 'ELITE';
    if (s >= 60) return 'POTENTIAL';
    if (s >= 40) return 'VIABLE';
    return 'RISK';
  };

  return (
    <div className="glass rounded-[24px] p-6 flex flex-col items-center justify-center border-white/5 bg-white/[0.02] relative group">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Venture Velocity</p>
      
      <div className="relative mb-4">
        <svg 
          width={radius * 2} 
          height={radius + 8} 
          className="overflow-visible transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
            <filter id="glow">
               <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
               <feMerge>
                   <feMergeNode in="coloredBlur"/>
                   <feMergeNode in="SourceGraphic"/>
               </feMerge>
            </filter>
          </defs>
          {/* Base Track */}
          <path
            d={`M ${stroke / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke / 2} ${radius}`}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Active Progress */}
          <path
            d={`M ${stroke / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke / 2} ${radius}`}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${halfCirc} ${halfCirc}`}
            strokeDashoffset={offset}
            filter="url(#glow)"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-5xl font-black brand-font tracking-tighter text-white" style={{ textShadow: `0 0 15px ${color}44` }}>
            {animated}
          </span>
          <span className="text-[9px] font-black mt-1 tracking-widest uppercase" style={{ color }}>
            {getLabel(score)}
          </span>
        </div>
      </div>

      <div className="mt-6 w-full py-2 px-4 rounded-xl bg-white/5 border border-white/5 text-center transition-colors group-hover:bg-white/10">
        <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase">
          Signal Confidence: <span className="text-white">OPTIMIZED</span>
        </p>
      </div>
    </div>
  );
};

export default ScoreGauge;
