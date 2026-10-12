import React from 'react';

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

interface StatusBadgeProps {
  tone: Tone;
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

const dotColors: Record<Tone, string> = {
  success: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
  warning: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
  danger: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]',
  neutral: 'bg-white/50',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ tone, children, pulse = false, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.13] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md text-[10px] font-semibold text-white/90 whitespace-nowrap ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[tone]} ${pulse ? 'status-pulse' : ''}`} />
      {children}
    </span>
  );
};

export default StatusBadge;