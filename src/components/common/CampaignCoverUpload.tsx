import React, { useRef, useState } from 'react';
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  value: string;
  onChange: (url: string) => void;
  /** رسالة خطأ من خارج المكوّن (مثل: الصورة مطلوبة) */
  error?: string;
}

/**
 * رفع صورة غلاف الحملة.
 * الصورة تنعرض من جهاز المستخدم مؤقتاً (URL.createObjectURL) لين يجي رفع فعلي للسيرفر.
 */
const CampaignCoverUpload: React.FC<Props> = ({ value, onChange, error }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState('');

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('الصيغة غير مدعومة. ارفع صورة JPG أو PNG أو WEBP');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`حجم الصورة أكبر من ${MAX_SIZE_MB} ميقابايت`);
      return;
    }

    setFileError('');
    onChange(URL.createObjectURL(file));
  };

  const shownError = fileError || error;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/80">صورة الحملة</label>
      <input ref={fileRef} type="file" accept={ALLOWED_TYPES.join(',')} hidden onChange={onPick} />

      {value ? (
        <div
          className={`relative h-[180px] rounded-[20px] overflow-hidden border bg-neutral-900 ${
            shownError ? 'border-red-500/60' : 'border-white/[0.14]'
          }`}
        >
          <img src={value} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-xs font-semibold text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              تغيير الصورة
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="حذف الصورة"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white/80 hover:text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`h-[180px] rounded-[20px] border border-dashed flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
            shownError
              ? 'border-red-500/60 bg-red-500/[0.04]'
              : 'border-white/[0.2] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/40'
          }`}
        >
          <ImagePlus className="w-6 h-6 text-white/60" />
          <span className="text-xs font-semibold text-white">ارفع صورة الحملة</span>
          <span className="text-[11px] text-white/50">يفضّل مقاس 1200×630 · JPG أو PNG أو WEBP · حتى {MAX_SIZE_MB} ميقابايت</span>
        </button>
      )}

      {shownError && <p className="text-[11px] text-red-400">{shownError}</p>}
    </div>
  );
};

export default CampaignCoverUpload;