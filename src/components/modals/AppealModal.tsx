import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  AlertTriangle, 
  UploadCloud, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Check, 
  XCircle,
  HelpCircle
} from 'lucide-react';

export const AppealModal: React.FC = () => {
  const {
    isAppealModalOpen,
    setIsAppealModalOpen,
    appealTarget,
    appealSubmission,
    resolveAppeal,
    showToast
  } = useApp();

  const [reason, setReason] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [evidenceName, setEvidenceName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [touched, setTouched] = useState<boolean>(false);

  if (!isAppealModalOpen || !appealTarget) return null;

  const { type, item } = appealTarget;
  const isVideo = type === 'video';

  const campaignTitle = item.campaignTitle;
  const brandName = item.brandName;
  const thumbnail = isVideo 
    ? (item as any).thumbnail 
    : ((item as any).previewImages?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&auto=format&fit=crop&q=80');
  
  const rejectionReason = item.rejectionReason || 'عدم الالتزام بالشروط المحددة في بريف الحملة.';

  const isExplanationValid = explanation.trim().length >= 20;
  const isFormValid = reason !== '' && isExplanationValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setTouched(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      appealSubmission(type, item.id, reason, explanation, evidenceName || undefined);
      setIsSubmitting(false);
      setIsAppealModalOpen(false);
      setReason('');
      setExplanation('');
      setEvidenceName('');
      setTouched(false);
    }, 400);
  };

  const handleSimulateResolution = (outcome: 'approved' | 'rejected') => {
    resolveAppeal(type, item.id, outcome);
    setIsAppealModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[28px] bg-surface border border-white/[0.18] p-6 sm:p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsAppealModalOpen(false)}
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col gap-1.5 mb-5 pr-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-300">مركز النزاعات والاعتراضات</span>
          </div>
          <h2 className="text-xl font-bold text-white font-heading">
            تقديم اعتراض على رفض العمل
          </h2>
          <p className="text-xs text-muted">
            سيتم تدقيق العمل يدوياً من فريق إشراف المنصة المستقل لضمان حقوقك.
          </p>
        </div>

        {/* Submission Summary Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-3">
            <img
              src={thumbnail}
              alt={campaignTitle}
              className="w-14 h-14 rounded-xl object-cover shrink-0 grayscale hover:grayscale-0 transition-all border border-white/10"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{campaignTitle}</span>
              <span className="text-[11px] text-muted mt-0.5">{brandName} · {item.submittedAt}</span>
              <span className="text-[10px] text-white/50 mt-0.5">
                نوع العمل: {isVideo ? 'مقطع فيديو مشاهدات' : 'تصميم جرافيك'}
              </span>
            </div>
          </div>

          {/* Rejection reason box */}
          <div className="p-2.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/25 flex items-start gap-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-semibold text-rose-200">سبب الرفض المسجل من العلامة التجارية:</span>
              <span className="text-[11px] text-rose-300/90 mt-0.5">{rejectionReason}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Reason Select Dropdown (Required) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white flex items-center justify-between">
              <span>سبب الاعتراض <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-white/40">مطلوب</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.05] border border-white/[0.15] text-white text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-surface-2 text-white/50">-- اختر سبب الاعتراض --</option>
              <option value="العمل يطابق شروط الدليل الإرشادي بالكامل" className="bg-surface-2 text-white">العمل يطابق شروط الدليل الإرشادي بالكامل</option>
              <option value="سبب الرفض غير دقيق" className="bg-surface-2 text-white">سبب الرفض غير دقيق</option>
              <option value="هناك خطأ في قياس المشاهدات" className="bg-surface-2 text-white">هناك خطأ في قياس المشاهدات</option>
              <option value="أسباب أخرى" className="bg-surface-2 text-white">أسباب أخرى</option>
            </select>
          </div>

          {/* Detailed Explanation Textarea (Required, min 20 chars) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-white">
                اشرح بالتفصيل لماذا ترى أن قرار الرفض غير منصف <span className="text-rose-400">*</span>
              </label>
              <span className={`text-[11px] font-mono ${
                explanation.trim().length >= 20 ? 'text-emerald-400' : 'text-white/40'
              }`}>
                {explanation.trim().length} / 20 حرف كحد أدنى
              </span>
            </div>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => {
                setExplanation(e.target.value);
                setTouched(true);
              }}
              placeholder="اشرح لمشرف المنصة كيف طابقت الشروط أو أين حدث الخطأ في قرار الرفض..."
              className={`w-full p-3 rounded-xl bg-white/[0.05] border text-xs text-white placeholder-white/30 focus:outline-none transition-all resize-none ${
                touched && !isExplanationValid
                  ? 'border-rose-500/60 focus:border-rose-500'
                  : 'border-white/[0.15] focus:border-white focus:ring-1 focus:ring-white'
              }`}
            />
            {touched && !isExplanationValid && (
              <p className="text-[11px] text-rose-400">
                يرجى كتابة 20 حرفاً على الأقل لتوضيح أسباب اعتراضك بالتفصيل.
              </p>
            )}
          </div>

          {/* Optional Evidence Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white flex items-center justify-between">
              <span>إثباتات إضافية (لقطة شاشة، رابط تحليلات، ملف)</span>
              <span className="text-[10px] text-white/40">اختياري</span>
            </label>
            <div 
              onClick={() => {
                setEvidenceName('screenshot-proof-' + Date.now().toString().slice(-4) + '.png');
                showToast('تم إرفاق لقطة الشاشة كدليل على الالتزام!');
              }}
              className="p-3 rounded-xl border border-dashed border-white/25 hover:border-white/50 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs text-white/70">
                <UploadCloud className="w-4 h-4 text-white/60" />
                <span>
                  {evidenceName ? `تم الإرفاق: ${evidenceName}` : 'انقر لاختيار لقطة شاشة، رابط أو ملف يدعم موقفك'}
                </span>
              </div>
              {evidenceName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEvidenceName('');
                  }}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Official Policy Note */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2.5 text-[11px] text-white/70">
            <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              يحق لك تقديم اعتراض واحد فقط لكل عمل، ويتم الرد بقرار نهائي وملزم خلال 3 أيام عمل.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`flex-1 py-3 px-4 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                isFormValid && !isSubmitting
                  ? 'bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.45)] hover:bg-neutral-100 hover:shadow-[0_0_32px_rgba(255,255,255,0.7)] cursor-pointer'
                  : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'جارٍ إرسال الاعتراض...' : 'إرسال الاعتراض للإدارة'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAppealModalOpen(false)}
              className="py-3 px-5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-xs font-semibold text-white transition-all cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>

        {/* Quick Testing Simulation Bar */}
        <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-white/50">
          <div className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-white/40" />
            <span>تجربة نتيجة الإشراف:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSimulateResolution('approved')}
              className="px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium transition-colors"
              title="محاكاة قبول الاعتراض واسترجاع الأرباح"
            >
              قبول الاعتراض (أرباح)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateResolution('rejected')}
              className="px-2.5 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium transition-colors"
              title="محاكاة رفض الاعتراض نهائياً"
            >
              رفض الاعتراض
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppealModal;
