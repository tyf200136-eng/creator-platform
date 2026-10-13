import React, { useState } from 'react';

interface ListBoxProps {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  mark: string;
  tone: 'do' | 'dont';
}

const ListBox: React.FC<ListBoxProps> = ({ title, items, onChange, placeholder, mark, tone }) => {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setInput('');
  };

  return (
    <div
      className={`p-3 rounded-xl bg-white/[0.02] border flex flex-col gap-2 ${
        tone === 'do' ? 'border-emerald-500/20' : 'border-rose-500/20'
      }`}
    >
      <span className={`text-xs font-bold ${tone === 'do' ? 'text-emerald-400' : 'text-rose-400'}`}>{title}</span>

      {items.map((d, i) => (
        <div key={i} className="text-[11px] text-white/80 flex items-center justify-between gap-2">
          <span>
            {mark} {d}
          </span>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            aria-label="حذف"
            className="text-white/40 hover:text-rose-400 cursor-pointer shrink-0"
          >
            ×
          </button>
        </div>
      ))}

      <div className="flex items-center gap-1 mt-1">
        <input
          type="text"
          maxLength={120}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
        />
        <button
          type="button"
          onClick={add}
          className="px-2.5 h-8 rounded-lg bg-white/10 text-xs text-white hover:bg-white hover:text-black cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
};

interface Props {
  dos: string[];
  donts: string[];
  onDosChange: (items: string[]) => void;
  onDontsChange: (items: string[]) => void;
  /** خط فاصل فوق القسم (نطفيه لما يكون القسم أول شي تحت العنوان) */
  divider?: boolean;
}

/** صندوقين جنب بعض: الشروط المطلوبة (أخضر) والممنوعات (أحمر). مشترك بين حملات المقاطع والتصميم. */
const DosDontsEditor: React.FC<Props> = ({ dos, donts, onDosChange, onDontsChange, divider = true }) => (
  <div className={`flex flex-col gap-3 ${divider ? 'pt-2 border-t border-white/[0.08]' : ''}`}>
    <label className="text-xs font-semibold text-white/90">الشروط والممنوعات (Do's and Don'ts)</label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <ListBox
        title="الشروط المطلوبة (Do's)"
        items={dos}
        onChange={onDosChange}
        placeholder="أضف شرطاً..."
        mark="✓"
        tone="do"
      />
      <ListBox
        title="الممنوعات (Don'ts)"
        items={donts}
        onChange={onDontsChange}
        placeholder="أضف ممنوعاً..."
        mark="✕"
        tone="dont"
      />
    </div>
  </div>
);

export default DosDontsEditor;