import React, { useRef, useState } from 'react';
import { Camera, ImagePlus } from 'lucide-react';
import FieldError from './FieldError';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  value: string;
  onChange: (url: string) => void;
  /** دائرة للصورة الشخصية، أو مربع بحواف دائرية للشعار */
  shape?: 'circle' | 'rounded';
  label: string;
  hint?: string;
  error?: string;
}

/**
 * رفع صورة شخصية أو شعار.
 * الصورة تنعرض من جهاز المستخدم مؤقتاً (URL.createObjectURL) لين يجي رفع فعلي للسيرفر.
 */
const AvatarUpload: React.FC<Props> = ({ value, onChange, shape = 'circle', label, hint, error }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState('');
  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const shownError = fileError || error;

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

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-4">
        <input ref={fileRef} type="file" accept={ALLOWED_TYPES.join(',')} hidden onChange={onPick} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label={label}
          className={`relative w-20 h-20 shrink-0 ${radius} overflow-hidden border flex items-center justify-center cursor-pointer group transition-colors ${
            shownError
              ? 'border-red-500/60 bg-red-500/[0.05]'
              : value
              ? 'border-white/30'
              : 'border-dashed border-white/25 bg-white/[0.04] hover:bg-white/[0.08]'
          }`}
        >
          {value ? (
            <>
              <img src={value} alt="" className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </span>
            </>
          ) : (
            <ImagePlus className="w-6 h-6 text-white/50" />
          )}
        </button>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-white">{label}</span>
          {hint && <span className="text-[11px] text-white/50">{hint}</span>}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="self-start mt-1 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-xs text-white cursor-pointer"
          >
            {value ? 'تغيير الصورة' : 'رفع صورة'}
          </button>
        </div>
      </div>
      <FieldError message={shownError} />
    </div>
  );
};

export default AvatarUpload;