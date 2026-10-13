import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import FieldError, { fieldBorder } from '../common/FieldError';
import { X, UploadCloud, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

const VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_VIDEO_MB = 500;
const MAX_IMAGE_MB = 10;
/** أطول مقطع مسموح (بالثواني) */
const MAX_DURATION_SEC = 180;
const MIN_TITLE = 5;
const MAX_TITLE = 80;
const MAX_NOTES = 500;

interface VideoInfo {
  kind: 'video' | 'image';
  url: string;
  name: string;
  sizeMb: number;
  duration: number;
  width: number;
  height: number;
  thumbnail: string;
}

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

/**
 * يقرأ معلومات الفيديو الحقيقية (المدة والأبعاد) ويطلع صورة مصغرة من أول ثانية.
 * الفيديو ينعرض من جهاز المستخدم مؤقتاً لين يجي رفع فعلي للسيرفر.
 */
const readVideo = (file: File): Promise<VideoInfo> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const base: VideoInfo = { kind: 'video', url, name: file.name, sizeMb: file.size / 1024 / 1024, duration: 0, width: 0, height: 0, thumbnail: '' };
    const video = document.createElement('video');
    let done = false;
    const finish = (info: VideoInfo) => {
      if (done) return;
      done = true;
      resolve(info);
    };
    // بعض المتصفحات ما تقدر تقرأ كل الصيغ: نقبل الملف بدون المدة والصورة بدل ما نعلّق
    const timer = setTimeout(() => finish(base), 6000);
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.onerror = () => {
      clearTimeout(timer);
      finish(base);
    };
    video.onloadedmetadata = () => {
      // ننتقل لأول ثانية عشان الصورة المصغرة ما تطلع سوداء
      video.currentTime = Math.min(1, (video.duration || 1) / 2);
    };
    video.onseeked = () => {
      clearTimeout(timer);
      let thumbnail = '';
      try {
        const canvas = document.createElement('canvas');
        const scale = 360 / Math.max(video.videoWidth, video.videoHeight, 1);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnail = canvas.toDataURL('image/jpeg', 0.75);
      } catch {
        thumbnail = '';
      }
      finish({ ...base, duration: video.duration || 0, width: video.videoWidth, height: video.videoHeight, thumbnail });
    };
    video.src = url;
  });

export const UploadDraftModal: React.FC = () => {
  const { isUploadDraftModalOpen, setIsUploadDraftModalOpen, selectedCampaign, addDraft } = useApp();

  const fileRef = useRef<HTMLInputElement>(null);
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [reading, setReading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  if (!isUploadDraftModalOpen || !selectedCampaign) return null;

  // ===================== حالات الخطأ =====================
  const errors = {
    video: !video ? 'ارفع فيديو أو صورة للمسودة' : undefined,
    title: !title.trim()
      ? 'اكتب عنوان المسودة'
      : title.trim().length < MIN_TITLE
      ? `العنوان قصير، ${MIN_TITLE} أحرف على الأقل`
      : undefined,
  };
  const err = (k: keyof typeof errors) => (showErrors ? errors[k] : undefined);
  const videoError = fileError || err('video');

  const pickFile = async (file?: File) => {
    if (!file) return;
    if (IMAGE_TYPES.includes(file.type)) {
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        setFileError(`حجم الصورة أكبر من ${MAX_IMAGE_MB} ميقابايت`);
        return;
      }
      setFileError('');
      if (video) URL.revokeObjectURL(video.url);
      const url = URL.createObjectURL(file);
      // نقرأ أبعاد الصورة للعرض
      const img = new Image();
      img.onload = () =>
        setVideo({ kind: 'image', url, name: file.name, sizeMb: file.size / 1024 / 1024, duration: 0, width: img.naturalWidth, height: img.naturalHeight, thumbnail: url });
      img.onerror = () => setFileError('ما قدرنا نقرأ الصورة، تأكد إن الملف سليم');
      img.src = url;
      return;
    }
    if (!VIDEO_TYPES.includes(file.type)) {
      setFileError('الصيغة غير مدعومة. ارفع فيديو (MP4 أو MOV) أو صورة (JPG أو PNG أو WEBP)');
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setFileError(`حجم الفيديو أكبر من ${MAX_VIDEO_MB} ميقابايت`);
      return;
    }
    setFileError('');
    setReading(true);
    try {
      const info = await readVideo(file);
      if (info.duration > MAX_DURATION_SEC) {
        URL.revokeObjectURL(info.url);
        setFileError(`المقطع أطول من ${MAX_DURATION_SEC / 60} دقائق (${formatDuration(info.duration)})`);
        return;
      }
      if (video) URL.revokeObjectURL(video.url);
      setVideo(info);
    } catch {
      setFileError('ما قدرنا نقرأ الفيديو، تأكد إن الملف سليم');
    } finally {
      setReading(false);
    }
  };

  const removeVideo = () => {
    if (video) URL.revokeObjectURL(video.url);
    setVideo(null);
  };

  const close = () => {
    setIsUploadDraftModalOpen(false);
    removeVideo();
    setTitle('');
    setNotes('');
    setFileError('');
    setShowErrors(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean) || reading) {
      setShowErrors(true);
      return;
    }
    addDraft({
      campaignId: selectedCampaign.id,
      campaignTitle: selectedCampaign.title,
      brandName: selectedCampaign.brandName,
      title: title.trim(),
      notes: notes.trim(),
      platform: selectedCampaign.platforms[0] ?? 'tiktok',
      videoUrl: video!.kind === 'video' ? video!.url : undefined,
      thumbnail: video!.thumbnail || undefined,
    });
    // ما نحذف رابط الفيديو هنا لأن المسودة تستخدمه للعرض
    setVideo(null);
    setTitle('');
    setNotes('');
    setShowErrors(false);
    setIsUploadDraftModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[28px] bg-[#121212] border border-white/[0.18] p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)]">
        <button
          onClick={close}
          aria-label="إغلاق"
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-1.5 mb-5">
          <span className="text-xs font-semibold text-white/50">{selectedCampaign.brandName}</span>
          <h2 className="text-xl font-bold text-white font-heading">رفع مسودة للموافقة المسبقة</h2>
          <p className="text-xs text-[#A3A3A3]">راجع المحتوى مع البراند قبل النشر على حسابك لضمان استحقاق الأرباح</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* الفيديو */}
          <div className="flex flex-col gap-1.5">
            <input
              ref={fileRef}
              type="file"
              accept={[...VIDEO_TYPES, ...IMAGE_TYPES].join(',')}
              hidden
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />

            {video ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.06]">
                {video.kind === 'video' ? (
                  <video
                    src={video.url}
                    poster={video.thumbnail || undefined}
                    controls
                    muted
                    playsInline
                    className="w-24 h-32 rounded-xl object-cover bg-black shrink-0"
                  />
                ) : (
                  <img src={video.url} alt="" className="w-24 h-32 rounded-xl object-cover bg-black shrink-0" />
                )}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate" dir="ltr">{video.name}</span>
                  </span>
                  <span className="text-[11px] text-white/60">
                    {video.kind === 'image'
                      ? `صورة · ${video.width}×${video.height} · `
                      : video.duration > 0
                      ? `المدة ${formatDuration(video.duration)} · ${video.width}×${video.height} · `
                      : ''}
                    {video.sizeMb.toFixed(1)} ميقابايت
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-[11px] text-white cursor-pointer"
                    >
                      {video.kind === 'video' ? 'تغيير الفيديو' : 'تغيير الصورة'}
                    </button>
                    <button
                      type="button"
                      onClick={removeVideo}
                      aria-label="حذف الملف"
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-red-500/20 border border-white/15 text-white/70 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  videoError
                    ? 'border-red-500/60 bg-red-500/[0.04]'
                    : isDragging
                    ? 'border-white/60 bg-white/[0.08]'
                    : 'border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/40'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                  {reading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                </div>
                <span className="text-xs font-bold text-white">
                  {reading ? 'جاري قراءة الفيديو...' : 'اسحب الفيديو أو الصورة هنا أو اضغط للاختيار'}
                </span>
                <span className="text-[10px] text-white/40">
                  فيديو MP4 أو MOV (حتى {MAX_VIDEO_MB} ميقا و{MAX_DURATION_SEC / 60} دقائق) · صورة JPG أو PNG أو WEBP (حتى {MAX_IMAGE_MB} ميقا)
                </span>
              </button>
            )}
            <FieldError message={videoError} />
          </div>

          {/* العنوان */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/80">عنوان المسودة أو الفكرة</label>
            <input
              type="text"
              maxLength={MAX_TITLE}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: فكرة فتح صندوق العطر مع رد فعل عفوي"
              className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('title'))} text-xs text-white focus:outline-none focus:border-white/40`}
            />
            <FieldError message={err('title')} />
          </div>

          {/* الملاحظات */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/80">ملاحظاتك للبراند (اختياري)</label>
              <span className="text-[11px] text-white/40 font-mono">{notes.length}/{MAX_NOTES}</span>
            </div>
            <textarea
              rows={3}
              maxLength={MAX_NOTES}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="وضّح للبراند أسلوب المونتاج أو اسأل عن كود الخصم والموسيقى المستخدمة..."
              className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white focus:outline-none focus:border-white/40 resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={reading}
            className="mt-2 w-full py-3 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:bg-neutral-100 transition-all text-center cursor-pointer disabled:opacity-40"
          >
            إرسال المسودة للمراجعة
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDraftModal;