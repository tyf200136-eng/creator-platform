import React from 'react';
import RiyalSymbol from '../RiyalSymbol';
import { AlertCircle, Plus } from 'lucide-react';

interface UnifiedBudgetInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number; // 1,000 for video, 300 for design
  max?: number;
  step?: number;
  label?: string;
  chips?: number[];
  campaignType?: 'video' | 'design';
  customError?: string;
}

export const UnifiedBudgetInput: React.FC<UnifiedBudgetInputProps> = ({
  value,
  onChange,
  min = 1000,
  max = 100000,
  step = 100,
  label = 'الميزانية المحددة',
  chips = [500, 1000, 5000],
  campaignType = 'video',
  customError,
}) => {
  const isBelowMin = value < min;
  const effectiveMin = min;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw === '' ? 0 : parseInt(raw, 10);
    onChange(num);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const addChip = (amount: number) => {
    onChange(Math.max(effectiveMin, value + amount));
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-white/90">{label}</label>
          <span className="text-[11px] text-white/50 font-mono">
            الحد الأدنى: {effectiveMin.toLocaleString()} <RiyalSymbol />
          </span>
        </div>
      )}

      {/* Large Numeric Input with Riyal Symbol inside */}
      <div className={`relative flex items-center rounded-2xl bg-white/[0.04] border transition-all ${
        isBelowMin
          ? 'border-rose-500/70 shadow-[0_0_16px_rgba(244,63,94,0.25)]'
          : 'border-white/[0.14] hover:border-white/30 focus-within:border-white focus-within:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
      }`}>
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? '' : value.toLocaleString('en-US')}
          onChange={handleInputChange}
          placeholder={effectiveMin.toLocaleString()}
          className="w-full h-14 pr-5 pl-14 bg-transparent text-xl sm:text-2xl font-black text-white font-mono tracking-tight text-right outline-none placeholder:text-white/20"
        />
        <div className="absolute left-4.5 flex items-center gap-1.5 pointer-events-none text-white/80">
          <RiyalSymbol className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Slider underneath staying in sync */}
      <div className="px-1 py-0.5">
        <input
          type="range"
          min={effectiveMin}
          max={max}
          step={step}
          value={Math.max(effectiveMin, Math.min(max, value))}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <div className="flex items-center justify-between text-[10px] text-white/40 font-mono mt-1">
          <span>{effectiveMin.toLocaleString()} <RiyalSymbol /></span>
          <span>{max.toLocaleString()} <RiyalSymbol /></span>
        </div>
      </div>

      {/* Quick Add Chips: +500 / +1,000 / +5,000 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-white/40 font-medium ml-1">إضافة سريعة:</span>
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => addChip(chip)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-mono font-medium text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-3 h-3 text-white/70" />
            <span>{chip.toLocaleString()}</span>
            <RiyalSymbol className="w-2.5 h-2.5 text-white/70" />
          </button>
        ))}
      </div>

      {/* Inline Error Message when below minimum */}
      {(isBelowMin || customError) && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-0.5 animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {customError ||
              `الميزانية أقل من الحد الأدنى المطلوب (${effectiveMin.toLocaleString()} <RiyalSymbol /> لحملات ${
                campaignType === 'design' ? 'التصميم' : 'المقاطع'
              })`}
          </span>
        </div>
      )}
    </div>
  );
};

export default UnifiedBudgetInput;
