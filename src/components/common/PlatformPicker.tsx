import React from 'react';
import { Check } from 'lucide-react';
import PlatformIcon from '../PlatformIcon';
import { SocialPlatform } from '../../types';

export const PLATFORM_OPTIONS: { id: SocialPlatform; label: string }[] = [
  { id: 'tiktok', label: 'تيك توك' },
  { id: 'instagram', label: 'إنستقرام' },
  { id: 'youtube', label: 'يوتيوب' },
  { id: 'snapchat', label: 'سناب' },
  { id: 'x', label: 'إكس' },
];

interface Props {
  value: SocialPlatform[];
  onChange: (platforms: SocialPlatform[]) => void;
  /** رسالة خطأ من خارج المكوّن (مثل: اختر منصة وحدة على الأقل) */
  error?: string;
}

/** اختيار المنصات اللي ينشر فيها صانع المحتوى مقاطع الحملة (لحملات المقاطع فقط) */
const PlatformPicker: React.FC<Props> = ({ value, onChange, error }) => {
  const toggle = (p: SocialPlatform) =>
    onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-white/90">منصات النشر (اختر منصة أو أكثر)</label>
      <p className="text-[11px] text-white/50 -mt-1">صانع المحتوى ينشر المقطع في حسابه على هذي المنصات، والمشاهدات تُحسب منها.</p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PLATFORM_OPTIONS.map((opt) => {
          const selected = value.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              aria-pressed={selected}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-1.5 text-xs transition-all cursor-pointer ${
                selected
                  ? 'bg-white text-black border-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                  : `bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white ${
                      error ? 'border-red-500/50' : 'border-white/[0.1]'
                    }`
              }`}
            >
              <span className="flex items-center gap-1.5">
                <PlatformIcon platform={opt.id} size={14} />
                <span>{opt.label}</span>
              </span>
              {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          );
        })}
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
};

export default PlatformPicker;