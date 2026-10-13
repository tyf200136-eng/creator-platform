import React, { useEffect, useRef } from 'react';
import { onlyDigits } from '../../utils/validators';
import { fieldBorder } from './FieldError';

interface Props {
  value: string[];
  onChange: (digits: string[]) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * خانات رمز التحقق: كل رقم في خانة، ينتقل تلقائياً للي بعدها،
 * ويقبل اللصق، ويحوّل الأرقام العربية.
 */
const OtpInput: React.FC<Props> = ({ value, onChange, error, disabled, autoFocus = true }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const length = value.length;

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  // لما يتفرغ الرمز (مثلاً بعد خطأ) نرجع لأول خانة
  useEffect(() => {
    if (value.every((d) => !d)) refs.current[0]?.focus();
  }, [value.join('')]);

  const setDigit = (i: number, raw: string) => {
    const v = onlyDigits(raw).slice(-1);
    const next = [...value];
    next[i] = v;
    onChange(next);
    if (v && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const d = onlyDigits(e.clipboardData.getData('text')).slice(0, length);
    if (!d) return;
    e.preventDefault();
    onChange(Array(length).fill('').map((_, i) => d[i] ?? ''));
    refs.current[Math.min(d.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" dir="ltr" onPaste={onPaste}>
      {value.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          aria-label={`الرقم ${i + 1}`}
          className={`w-14 h-14 text-center rounded-xl bg-white/[0.05] border ${fieldBorder(error)} text-xl font-bold font-mono text-white focus:outline-none focus:border-white focus:bg-white/[0.08] transition-all disabled:opacity-40`}
        />
      ))}
    </div>
  );
};

export default OtpInput;