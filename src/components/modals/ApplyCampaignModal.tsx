import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PlatformIcon from '../PlatformIcon';
import {
  X,
  CheckCircle2,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { RiyalSymbol } from '../RiyalSymbol';
import FieldError, { fieldBorder } from '../common/FieldError';

const MIN_MOTIVATION = 30;
const MIN_ANSWER = 10;
const MAX_TEXT = 500;
/** لو البراند ما كتب سؤال (حملات قديمة) نستخدم هذا */
const DEFAULT_QUESTION = 'وش اللي يميّز محتواك عن غيرك؟';

export const ApplyCampaignModal: React.FC = () => {
  const {
    isApplyModalOpen,
    setIsApplyModalOpen,
    selectedCampaign,
    creatorProfile,
    setIsConnectAccountModalOpen,
    showToast,
    joinCampaign
  } = useApp();

  // كل شي يبدأ فاضي، وصانع المحتوى يعبّيه بنفسه
  const [motivation, setMotivation] = useState('');
  const [screeningAnswer, setScreeningAnswer] = useState('');
  const [selectedAccountHandle, setSelectedAccountHandle] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  if (!isApplyModalOpen || !selectedCampaign) return null;

  // الحسابات المربوطة اللي على منصات الحملة بس
  const eligibleAccounts = creatorProfile.linkedAccounts.filter(
    (a) => a.connected && selectedCampaign.platforms.includes(a.platform)
  );
  const question = selectedCampaign.screeningQuestion?.trim() || DEFAULT_QUESTION;

  // ===================== حالات الخطأ =====================
  const errors = {
    account: !eligibleAccounts.length
      ? 'ما عندك حساب مربوط على منصات هذي الحملة. اربط حساب أول'
      : !eligibleAccounts.some((a) => a.handle === selectedAccountHandle)
      ? 'اختر الحساب اللي بتنشر منه'
      : undefined,
    motivation: !motivation.trim()
      ? 'اكتب ليش أنت مناسب للحملة'
      : motivation.trim().length < MIN_MOTIVATION
      ? `وضّح أكثر، ${MIN_MOTIVATION} حرف على الأقل`
      : undefined,
    answer: !screeningAnswer.trim()
      ? 'جاوب على سؤال البراند'
      : screeningAnswer.trim().length < MIN_ANSWER
      ? 'الإجابة قصيرة'
      : undefined,
  };
  const err = (k: keyof typeof errors) => (showErrors ? errors[k] : undefined);

  const close = () => {
    setIsApplyModalOpen(false);
    setMotivation('');
    setScreeningAnswer('');
    setSelectedAccountHandle('');
    setShowErrors(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    joinCampaign(selectedCampaign);
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[28px] bg-surface border border-white/[0.18] p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={close}
          aria-label="إغلاق"
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1.5 mb-5">
          <div className="flex items-center gap-1.5 text-xs text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>حملة تتطلب موافقة مسبقة</span>
          </div>
          <h2 className="text-xl font-bold text-white font-heading">
            التقديم على الحملة
          </h2>
          <p className="text-xs text-muted">
            {selectedCampaign.title}
          </p>
        </div>

        {/* Campaign Mini Summary Card */}
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center gap-3 mb-5">
          <img
            src={selectedCampaign.coverImage}
            alt={selectedCampaign.title}
            className="w-16 h-12 rounded-xl object-cover shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">{selectedCampaign.brandName}</span>
            <span className="text-[11px] text-white/60">معدل العائد: {selectedCampaign.ratePer1k} <RiyalSymbol /> / 1K</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Choose Linked Account */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/80">اختر الحساب الذي ستنشر منه</label>
              <button
                type="button"
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setIsConnectAccountModalOpen(true);
                }}
                className="text-[11px] text-white/70 hover:text-white flex items-center gap-1 underline"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة حساب جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {eligibleAccounts.map((acc) => (
                <div
                  key={acc.handle}
                  onClick={() => setSelectedAccountHandle(acc.handle)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedAccountHandle === acc.handle
                      ? 'bg-white/[0.12] border-white text-white'
                      : 'bg-white/[0.04] border-white/[0.1] text-white/70 hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={acc.platform} size={15} />
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold text-white">{acc.handle}</span>
                      <span className="text-[10px] text-white/50">{acc.followers} متابع</span>
                    </div>
                  </div>
                  {selectedAccountHandle === acc.handle && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                </div>
              ))}
            </div>
            <FieldError message={err('account')} />
          </div>

          {/* Why are you a good fit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/80">ليش أنت مناسب لهذه الحملة؟</label>
            <textarea
              rows={3}
              maxLength={MAX_TEXT}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="مثال: أصوّر مراجعات عطور من سنتين، وجمهوري أغلبه من الرياض..."
              className={`w-full p-3 rounded-xl bg-white/[0.05] border ${fieldBorder(err('motivation'))} text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all resize-none leading-relaxed`}
            />
            <FieldError message={err('motivation')} />
          </div>

          {/* Screening Question */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/80">
              سؤال البراند: {question}
            </label>
            <textarea
              rows={2}
              maxLength={MAX_TEXT}
              value={screeningAnswer}
              onChange={(e) => setScreeningAnswer(e.target.value)}
              placeholder="اكتب إجابتك..."
              className={`w-full p-3 rounded-xl bg-white/[0.05] border ${fieldBorder(err('answer'))} text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all resize-none leading-relaxed`}
            />
            <FieldError message={err('answer')} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 w-full py-3 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:shadow-[0_0_28px_rgba(255,255,255,0.65)] hover:bg-neutral-100 transition-all text-center"
          >
            أرسل الطلب
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyCampaignModal;