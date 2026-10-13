import React, { useState } from 'react';
import { Link2, Plus, Trash2, ExternalLink } from 'lucide-react';

export type ReferenceLink = {
  title: string;
  url: string;
  type: 'drive' | 'notion' | 'brief' | 'video';
};

const MAX_LINKS = 5;

/** نوع الرابط يتحدد تلقائياً من عنوانه، فصاحب الحملة ما يحتاج يختاره */
const detectType = (url: string): ReferenceLink['type'] => {
  const u = url.toLowerCase();
  if (u.includes('drive.google') || u.includes('docs.google') || u.includes('dropbox')) return 'drive';
  if (u.includes('notion.')) return 'notion';
  if (/(youtube\.com|youtu\.be|tiktok\.com|instagram\.com|vimeo\.com|snapchat\.com|x\.com|twitter\.com)/.test(u)) return 'video';
  return 'brief';
};

/** يقبل فقط روابط https كاملة (مثل https://drive.google.com/...) */
const isValidUrl = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname.includes('.');
  } catch {
    return false;
  }
};

interface Props {
  value: ReferenceLink[];
  onChange: (links: ReferenceLink[]) => void;
}

/**
 * روابط مرجعية للحملة (دليل الهوية، بريف، أمثلة مقاطع...).
 * تنعرض لصانع المحتوى في صفحة تفاصيل الحملة. اختيارية.
 */
const ReferenceLinksEditor: React.FC<Props> = ({ value, onChange }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [titleError, setTitleError] = useState('');
  const [urlError, setUrlError] = useState('');

  const reachedMax = value.length >= MAX_LINKS;

  const add = () => {
    const t = title.trim();
    const u = url.trim();
    let ok = true;

    if (!t) {
      setTitleError('اكتب عنواناً يوضح وش في الرابط');
      ok = false;
    } else setTitleError('');

    if (!u) {
      setUrlError('الصق الرابط');
      ok = false;
    } else if (!isValidUrl(u)) {
      setUrlError('الرابط غير صحيح. لازم يبدأ بـ https://');
      ok = false;
    } else if (value.some((l) => l.url === u)) {
      setUrlError('هذا الرابط مضاف من قبل');
      ok = false;
    } else setUrlError('');

    if (!ok) return;
    onChange([...value, { title: t, url: u, type: detectType(u) }]);
    setTitle('');
    setUrl('');
  };

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  };

  const inputBase = 'w-full h-10 px-3 rounded-xl bg-white/[0.05] border text-xs text-white';

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white/90">روابط مرجعية (اختياري)</label>
        <span className="text-[11px] text-white/40">
          {value.length}/{MAX_LINKS}
        </span>
      </div>
      <p className="text-[11px] text-white/50 -mt-1">دليل الهوية، بريف الحملة، أمثلة مقاطع تعجبك... تظهر لصانع المحتوى في صفحة الحملة.</p>

      {value.length > 0 && (
        <div className="flex flex-col gap-2">
          {value.map((link, idx) => (
            <div
              key={link.url}
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-2 text-xs text-white"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Link2 className="w-3.5 h-3.5 text-white/60 shrink-0" />
                <span className="font-medium truncate">{link.title}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  dir="ltr"
                  className="text-[11px] text-white/40 hover:text-white/70 truncate flex items-center gap-1"
                >
                  {new URL(link.url).hostname}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                aria-label="حذف الرابط"
                className="text-white/50 hover:text-red-400 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!reachedMax && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-2 items-start">
            <div className="flex flex-col gap-1">
              <input
                type="text"
                maxLength={60}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                onKeyDown={onEnter}
                placeholder="عنوان الرابط (مثال: دليل الهوية)"
                className={`${inputBase} ${titleError ? 'border-red-500/60' : 'border-white/[0.12]'}`}
              />
              {titleError && <p className="text-[11px] text-red-400">{titleError}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <input
                type="url"
                dir="ltr"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (urlError) setUrlError('');
                }}
                onKeyDown={onEnter}
                placeholder="https://"
                className={`${inputBase} text-left ${urlError ? 'border-red-500/60' : 'border-white/[0.12]'}`}
              />
              {urlError && <p className="text-[11px] text-red-400">{urlError}</p>}
            </div>
            <button
              type="button"
              onClick={add}
              className="h-10 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.14] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceLinksEditor;