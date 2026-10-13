import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import FieldError, { fieldBorder } from '../common/FieldError';
import { X, AlertTriangle, Clock } from 'lucide-react';

export const RejectReasonModal: React.FC = () => {
  const {
    isRejectModalOpen,
    setIsRejectModalOpen,
    selectedSubmission,
    rejectSubmission,
  } = useApp();

  const [reason, setReason] = useState('ما التزم بالشروط المحددة');
  const [note, setNote] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  if (!isRejectModalOpen || !selectedSubmission) return null;

  const reasonsList = [
    'ما التزم بالشروط المحددة في بريف الحملة',
    'محتوى مكرر أو منسوخ من صانع آخر',
    'مشاهدات مشبوهة / نسبة روبوتات مرتفعة (Bot Score)',
    'جودة التصوير أو الصوت لا ترقى للمعايير المطلوبة',
    'أخرى (توضيح في الملاحظة أدناه)',
  ];

  // لو اختار "أخرى" لازم يوضّح السبب في الملاحظة
  const isOther = reason.startsWith('أخرى');
  const noteError = isOther && note.trim().length < 10 ? 'بما إنك اخترت "أخرى"، وضّح السبب لصانع المحتوى (10 أحرف على الأقل)' : undefined;

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteError) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setNote('');
    const finalReason = note ? `${reason} (${note})` : reason;
    rejectSubmission(selectedSubmission.id, finalReason);
    setIsRejectModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[28px] bg-[#121212] border border-white/[0.18] p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)]">
        {/* Close Button */}
        <button
          onClick={() => setIsRejectModalOpen(false)}
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white font-heading">
            تحديد سبب رفض المقطع
          </h2>
          <p className="text-xs text-[#A3A3A3]">
            سيتم إشعار صانع المحتوى بالسبب لمنحه فرصة تعديل المقطع أو الاعتراض
          </p>
        </div>

        {/* 7-day Review Notice */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 shrink-0" />
          <span>متبقي 4 أيام في مهلة المراجعة (7 أيام). في حال عدم الرد سيُقبل آلياً.</span>
        </div>

        <form onSubmit={handleConfirmReject} noValidate className="flex flex-col gap-4">
          {/* Reasons Radio list */}
          <div className="flex flex-col gap-2">
            {reasonsList.map((r) => (
              <label
                key={r}
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${
                  reason === r
                    ? 'bg-white/[0.1] border-white text-white font-semibold'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06]'
                }`}
              >
                <input
                  type="radio"
                  name="reject_reason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="rounded-full text-white focus:ring-0"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          {/* Additional note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/80">
              ملاحظات توضيحية لصانع المحتوى {isOther ? '(مطلوبة)' : '(اختياري)'}
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: لم يتم ذكر كود الخصم في الكابشن..."
              className={`w-full p-3 rounded-xl bg-white/[0.05] border ${fieldBorder(showErrors ? noteError : undefined)} text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40 resize-none`}
            />
            <FieldError message={showErrors ? noteError : undefined} />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="mt-2 w-full py-3 px-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all text-center"
          >
            تأكيد رفض المقطع
          </button>
        </form>
      </div>
    </div>
  );
};

export default RejectReasonModal;