import React, { useState, useId, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import PlatformIcon from '../PlatformIcon';
import { SocialPlatform } from '../../types';
import FieldError, { fieldBorder } from '../common/FieldError';
import { platformUrlError, designSourceUrlError } from '../../utils/validators';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_MB = 10;
const MAX_SOURCE_FILE_MB = 200;
const SOURCE_FILE_EXT = ['psd', 'ai', 'pdf', 'png', 'jpg', 'jpeg', 'svg', 'zip', 'fig'];
const MAX_IMAGES = 10;
const VIDEO_PLACEHOLDER: Record<string, string> = {
  tiktok: 'https://www.tiktok.com/@account/video/...',
  instagram: 'https://www.instagram.com/reel/...',
  youtube: 'https://youtube.com/shorts/...',
  snapchat: 'https://www.snapchat.com/spotlight/...',
  x: 'https://x.com/account/status/...',
};
import {
  X,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Check,
  Loader2,
  UploadCloud,
  FileText,
  ShieldCheck,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  Trash2,
  Lock,
  Layers
} from 'lucide-react';

export const SubmitClipModal: React.FC = () => {
  const { 
    isSubmitClipModalOpen, 
    setIsSubmitClipModalOpen, 
    selectedCampaign, 
    addSubmission,
    addDesignSubmission,
    creatorProfile,
    showToast 
  } = useApp();

  // Video State
  const [videoUrl, setVideoUrl] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>('tiktok');
  const [videoAgreed, setVideoAgreed] = useState(false);

  // أول ما تنفتح النافذة، نختار أول منصة من منصات الحملة (بدل تيك توك الثابتة)
  useEffect(() => {
    const allowed = selectedCampaign?.platforms ?? [];
    if (allowed.length > 0 && !allowed.includes(platform)) {
      setPlatform(allowed[0]);
    }
  }, [isSubmitClipModalOpen, selectedCampaign]);
  const [isVerifying, setIsVerifying] = useState(false);

  // Design State
  const [designIdea, setDesignIdea] = useState('');
  // كل شي يبدأ فاضي، والمصمم يرفع شغله بنفسه
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; format: string }[]>([]);
  const [figmaUrl, setFigmaUrl] = useState(''); // رابط الملف المصدري: فيقما أو كانفا أو قوقل درايف
  const [uploadError, setUploadError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvaUrl, setCanvaUrl] = useState('');
  const [designAgreed, setDesignAgreed] = useState(false);
  const [isSubmittingDesign, setIsSubmittingDesign] = useState(false);

  if (!isSubmitClipModalOpen || !selectedCampaign) return null;

  const isDesignCampaign = selectedCampaign.campaignType === 'design';
  const designDetails = selectedCampaign.designDetails;

  // =========================================================================
  // VIDEO HANDLERS
  // =========================================================================
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setVideoUrl(val);
    if (val.length > 8) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
      }, 500);
    }
  };

  const videoUrlError = platformUrlError(videoUrl, platform);
  const hasEnteredVideoUrl = !videoUrlError;
  const isAccountConnected = creatorProfile.linkedAccounts.some(
    a => a.platform === platform && a.connected
  );

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnteredVideoUrl || !videoAgreed) {
      setShowErrors(true);
      return;
    }

    addSubmission(selectedCampaign.id, videoUrl, platform);
    setIsSubmitClipModalOpen(false);
    setVideoUrl('');
    setVideoAgreed(false);
  };

  // =========================================================================
  // DESIGN LOGIC & CHECKS
  // =========================================================================
  const isBundle = Boolean(designDetails?.isBundle);
  const hasFigmaField = designDetails?.formats?.some(f => f.includes('Figma')) ?? true;
  const hasCanvaField = designDetails?.formats?.some(f => f.includes('Canva')) ?? false;

  const sourceLinkError = designSourceUrlError(figmaUrl);
  const isFigmaValid = !sourceLinkError;
  const isCanvaValid = isFigmaValid;

  // Live checks
  const checkSizeMatched = uploadedImages.length > 0;
  const checkHighRes = uploadedImages.length > 0;
  const checkFormatsPresent = uploadedImages.length > 0 && (uploadedFiles.length > 0 || isFigmaValid);
  const checkLinkValid = isFigmaValid;
  const maxImages = isBundle ? Math.max(designDetails?.carouselSlidesCount ?? MAX_IMAGES, 2) : 1;

  // ===================== حالات الخطأ (التصميم) =====================
  const designErrors = {
    images: uploadedImages.length === 0 ? 'ارفع صورة التصميم (معاينة)' : undefined,
    link: sourceLinkError,
    agreed: !designAgreed ? 'لازم تقر بأن التصميم من عملك' : undefined,
  };
  const dErr = (k: keyof typeof designErrors) => (showErrors ? designErrors[k] : undefined);

  const onPickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    const bad = files.find((f) => !IMAGE_TYPES.includes(f.type) || f.size > MAX_IMAGE_MB * 1024 * 1024);
    if (bad) {
      setUploadError(!IMAGE_TYPES.includes(bad.type) ? 'صور المعاينة لازم تكون JPG أو PNG أو WEBP' : `حجم الصورة أكبر من ${MAX_IMAGE_MB} ميقابايت`);
      return;
    }
    const room = maxImages - uploadedImages.length;
    if (files.length > room) setUploadError(`الحد الأقصى ${maxImages} ${maxImages === 1 ? 'صورة' : 'صور'}`);
    else setUploadError('');
    setUploadedImages((prev) => [...prev, ...files.slice(0, room).map((f) => URL.createObjectURL(f))]);
  };

  const onPickSourceFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    const ok: { name: string; size: string; format: string }[] = [];
    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (!SOURCE_FILE_EXT.includes(ext)) {
        setUploadError(`الملف ${f.name} صيغته غير مقبولة`);
        return;
      }
      if (f.size > MAX_SOURCE_FILE_MB * 1024 * 1024) {
        setUploadError(`الملف ${f.name} أكبر من ${MAX_SOURCE_FILE_MB} ميقابايت، ارفعه على قوقل درايف وحط الرابط`);
        return;
      }
      ok.push({ name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB`, format: ext.toUpperCase() });
    }
    setUploadError('');
    setUploadedFiles((prev) => [...prev, ...ok]);
  };

  const allDesignChecksPassed = 
    checkSizeMatched && 
    checkHighRes && 
    checkFormatsPresent && 
    checkLinkValid && 
    designAgreed;

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newArr = [...uploadedImages];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newArr.length) return;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setUploadedImages(newArr);
  };


  const handleDesignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(designErrors).some(Boolean)) {
      setShowErrors(true);
      requestAnimationFrame(() =>
        document.querySelector('[data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      );
      return;
    }

    setIsSubmittingDesign(true);
    setTimeout(() => {
      addDesignSubmission({
        campaignId: selectedCampaign.id,
        note: designIdea || 'تصميم بوست وهويات الحملة',
        previewImages: uploadedImages,
        figmaUrl: figmaUrl.includes('figma.com') ? figmaUrl.trim() : undefined,
        canvaUrl: figmaUrl.includes('canva.com') ? figmaUrl.trim() : undefined,
        files: uploadedFiles.map(f => ({ name: f.name, url: '#', format: f.format, size: f.size })),
      });
      setIsSubmittingDesign(false);
      setIsSubmitClipModalOpen(false);
      setDesignAgreed(false);
      setUploadedImages([]);
      setUploadedFiles([]);
      setFigmaUrl('');
      setDesignIdea('');
      setShowErrors(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className={`relative w-full ${isDesignCampaign ? 'max-w-2xl' : 'max-w-lg'} rounded-[28px] bg-surface border border-white/[0.18] p-6 sm:p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)] max-h-[92vh] overflow-y-auto`}>
        {/* Close Button */}
        <button
          onClick={() => {
            setIsSubmitClipModalOpen(false);
            setShowErrors(false);
            setUploadError('');
          }}
          aria-label="إغلاق"
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* =====================================================================
            DESIGN CAMPAIGN UPLOAD MODAL
            ===================================================================== */}
        {isDesignCampaign ? (
          <div>
            {/* Header */}
            <div className="flex flex-col gap-1.5 mb-6 pr-1">
              <span className="text-xs font-semibold text-white/50">{selectedCampaign.brandName}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                ارفع تصميمك
              </h2>
              <p className="text-xs text-muted truncate">
                {selectedCampaign.title}
              </p>
            </div>

            <form onSubmit={handleDesignSubmit} className="flex flex-col gap-5">
              {/* Image Dropzone (PNG / JPG) with Live Preview */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-white/70" />
                    <span>معاينة التصميم (PNG / JPG)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-white/50">
                    المقاس المطلوب: {designDetails?.sizes?.join(' أو ') || '1080×1350'}
                  </span>
                </div>

                {/* Previews with watermark visual simulator */}
                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((imgUrl, idx) => (
                    <div 
                      key={idx}
                      className="relative w-36 aspect-[4/5] rounded-2xl overflow-hidden border border-white/20 bg-neutral-900 group shadow-lg"
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Design ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      {/* Watermark preview overlay */}
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-white/60 -rotate-12 border border-white/20 px-2 py-0.5 rounded uppercase tracking-wider bg-black/40">
                          معاينة مؤقتة
                        </span>
                      </div>

                      {/* Controls on hover / if multiple */}
                      {isBundle && uploadedImages.length > 1 && (
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/80 rounded-lg p-0.5 border border-white/20">
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-white/70 hover:text-white disabled:opacity-30"
                            title="تحريك للأمام"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 'down')}
                            disabled={idx === uploadedImages.length - 1}
                            className="p-1 text-white/70 hover:text-white disabled:opacity-30"
                            title="تحريك للخلف"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {uploadedImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute bottom-1.5 left-1.5 p-1 rounded-lg bg-rose-500/80 text-white hover:bg-rose-600 transition-colors"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* رفع صور المعاينة */}
                  <input ref={imageInputRef} type="file" accept={IMAGE_TYPES.join(',')} multiple={isBundle} hidden onChange={onPickImages} />
                  {uploadedImages.length < maxImages && (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className={`w-36 aspect-[4/5] rounded-2xl border-2 border-dashed ${
                        dErr('images') ? 'border-red-500/60 bg-red-500/[0.04]' : 'border-white/20 hover:border-white/50 bg-white/[0.02] hover:bg-white/[0.06]'
                      } flex flex-col items-center justify-center gap-1.5 text-xs text-white/60 hover:text-white transition-all cursor-pointer`}
                    >
                      <UploadCloud className="w-6 h-6 text-white/50" />
                      <span>{uploadedImages.length === 0 ? 'ارفع التصميم' : '+ إضافة سلايد'}</span>
                    </button>
                  )}
                </div>
                <FieldError message={dErr('images') || uploadError || undefined} />
              </div>

              {/* Source Files Dropzone (PSD / PDF / AI) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>الملفات المفتوحة والمصدرية (PSD / PDF / AI)</span>
                  <span className="text-[10px] text-white/40">حسب طلب البراند</span>
                </label>
                <input ref={fileInputRef} type="file" multiple hidden onChange={onPickSourceFiles} accept={SOURCE_FILE_EXT.map((e) => '.' + e).join(',')} />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-2xl border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-white/60" />
                    <div className="flex flex-col text-xs text-white/80">
                      <span className="font-semibold">ملفات العمل المرفقة ({uploadedFiles.length})</span>
                      <span className="text-[10px] text-white/40">
                        {uploadedFiles.length ? uploadedFiles.map(f => f.name).join(' · ') : 'PSD أو AI أو PDF · حتى 200 ميقابايت للملف'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-white/60 underline">إضافة ملف</span>
                </div>
              </div>

              {/* Source Link Field (Figma / Canva / Google Drive / Dropbox) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-white flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-white/60" />
                    <span>رابط التصميم المصدري (Figma / Canva / Google Drive / Dropbox link)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] text-white/50">صلاحية المعاينة والتعديل</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    placeholder="https://www.figma.com/... أو canva.com أو drive.google.com"
                    dir="ltr"
                    className={`w-full h-11 pl-4 pr-10 rounded-xl bg-white/[0.05] border text-xs text-white font-mono placeholder-white/30 focus:outline-none transition-all ${
                      dErr('link')
                        ? 'border-red-500/60'
                        : isFigmaValid
                        ? 'border-emerald-500/60 focus:border-emerald-400'
                        : 'border-white/[0.14] focus:border-white'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isFigmaValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <LinkIcon className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-white/45">تأكد إن الرابط مفتوح للمشاهدة لأي أحد عنده الرابط</span>
                <FieldError message={dErr('link')} />
              </div>

              {/* Live Checklist */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2">
                <span className="text-[11px] font-bold text-white/70">الفحص الفوري للمواصفات:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Check 1 */}
                  <div className="flex items-center gap-2 text-white/90">
                    {checkSizeMatched ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                    )}
                    <span>المقاس مطابق (1080×1350 أو 1080×1920)</span>
                  </div>

                  {/* Check 2 */}
                  <div className="flex items-center gap-2 text-white/90">
                    {checkHighRes ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                    )}
                    <span>الدقة عالية (300 DPI / دقة شاشة صافية)</span>
                  </div>

                  {/* Check 3 */}
                  <div className="flex items-center gap-2 text-white/90">
                    {checkFormatsPresent ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                    )}
                    <span>كل الصيغ المطلوبة متوفرة (PNG, PSD, PDF)</span>
                  </div>

                  {/* Check 4 */}
                  <div className="flex items-center gap-2 text-white/90">
                    {isFigmaValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                    )}
                    <span>رابط الملف المصدري صالح ومفتوح</span>
                  </div>
                </div>
              </div>

              {/* Field: ملاحظات للمعلن / المصمم */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>ملاحظات للمعلن / المصمم</span>
                  <span className="text-[10px] text-white/40">اختياري</span>
                </label>
                <textarea
                  rows={2}
                  value={designIdea}
                  onChange={(e) => setDesignIdea(e.target.value)}
                  placeholder="ملاحظات حول الفكرة التصميمية، الألوان، أو الخطوط المستخدمة..."
                  className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white transition-all resize-none"
                />
              </div>

              {/* Watermark Notice */}
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-start gap-2.5 text-xs text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  تشاهد العلامة التجارية تصميمك بعلامة مائية حتى يتم قبوله، لحماية حقوقك الفكرية.
                </span>
              </div>

              {/* Required Ownership Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={designAgreed}
                  onChange={(e) => setDesignAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-white/10 text-white focus:ring-0"
                />
                <span className="text-xs text-muted leading-relaxed">
                  أقرّ بأن التصميم من عملي الأصلي، وبعد القبول تنتقل ملكيته للعلامة التجارية.
                </span>
              </label>
              <FieldError message={dErr('agreed')} />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingDesign}
                className="w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:shadow-[0_0_32px_rgba(255,255,255,0.7)] hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingDesign ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ معالجة وإرسال التصميم...</span>
                  </>
                ) : (
                  <span>أرسل التصميم</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* =====================================================================
              VIDEO (CPM) CAMPAIGN MODAL (EXACTLY AS SPECIFIED)
              ===================================================================== */
          <div>
            {/* Header */}
            <div className="flex flex-col gap-1.5 mb-5">
              <span className="text-xs font-semibold text-white/50">{selectedCampaign.brandName}</span>
              <h2 className="text-xl font-bold text-white font-heading">
                إرسال مقطع جديد للحملة
              </h2>
              <p className="text-xs text-muted truncate">
                {selectedCampaign.title}
              </p>
            </div>

            <form onSubmit={handleVideoSubmit} className="flex flex-col gap-4">
              {/* Choose Platform */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-white/80">المنصة المنشور عليها</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {selectedCampaign.platforms.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                        platform === p
                          ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                          : 'bg-white/[0.04] text-white/70 border-white/[0.1] hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <PlatformIcon platform={p} size={13} />
                      <span className="capitalize">{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paste Video URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/80">رابط الفيديو المباشر</label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={handleVideoUrlChange}
                    placeholder={VIDEO_PLACEHOLDER[platform]}
                    className={`w-full h-11 pr-10 pl-4 rounded-xl bg-white/[0.05] border ${fieldBorder(showErrors || videoUrl.trim().length > 10 ? videoUrlError : undefined)} text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all font-mono`}
                    dir="ltr"
                  />
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                </div>
                <FieldError message={showErrors || videoUrl.trim().length > 10 ? videoUrlError : undefined} />
              </div>

              {/* 3 Live Checks with check/cross */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2.5">
                <span className="text-[11px] font-bold text-white/70">الفحص الفوري للمقطع:</span>

                {/* Check 1 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white/90">
                    {hasEnteredVideoUrl ? (
                      isAccountConnected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20" />
                    )}
                    <span>من حساب مربوط في المنصة</span>
                  </div>
                  <span className="text-[11px] text-white/50 font-mono">
                    {hasEnteredVideoUrl ? (isAccountConnected ? '@noura_shortss' : 'غير مربوط') : '—'}
                  </span>
                </div>

                {/* Check 2 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white/90">
                    {hasEnteredVideoUrl ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20" />
                    )}
                    <span>لم يتم إرساله من قبل (معرف أصلي فريد)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400">
                    {hasEnteredVideoUrl ? 'متحقق ✓' : '—'}
                  </span>
                </div>

                {/* Check 3 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white/90">
                    {hasEnteredVideoUrl ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20" />
                    )}
                    <span>منشور خلال آخر 30 دقيقة للبدء في تتبع المشاهدات</span>
                  </div>
                  <span className="text-[11px] text-emerald-400">
                    {hasEnteredVideoUrl ? 'مؤهل ✓' : '—'}
                  </span>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer mt-1 select-none">
                <input
                  type="checkbox"
                  checked={videoAgreed}
                  onChange={(e) => setVideoAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-white/10 text-white focus:ring-0"
                />
                <span className="text-xs text-muted leading-relaxed">
                  أقر بأنني التزمت بجميع شروط الحملة وعدم حذف المقطع لمدة 30 يوماً من تاريخ النشر.
                </span>
              </label>
              <FieldError message={showErrors && !videoAgreed ? 'لازم توافق على التعهد' : undefined} />

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-2 w-full py-3 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:shadow-[0_0_28px_rgba(255,255,255,0.65)] hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق من الرابط...</span>
                  </>
                ) : (
                  <span>أرسل المقطع</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitClipModal;