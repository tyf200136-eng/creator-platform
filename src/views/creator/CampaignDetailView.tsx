import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import PlatformIcon from '../../components/PlatformIcon';
import StatusBadge from '../../components/common/StatusBadge';
import { DesignSubmission } from '../../types';
import {
  ArrowRight,
  Share2,
  CheckCircle2,
  Lock,
  FileText,
  ExternalLink,
  TrendingUp,
  Users,
  Check,
  X as XIcon,
  Crown,
  BarChart2,
  Clock,
  Palette,
  Download,
  Copy,
  AlertCircle,
  RotateCcw,
  XCircle,
  PenTool,
  LayoutTemplate,
  Layers,
  Image as ImageIcon,
  FlaskConical
} from 'lucide-react';

export const CampaignDetailView: React.FC = () => {
  const { 
    selectedCampaign, 
    setCreatorView, 
    setIsSubmitClipModalOpen, 
    setIsApplyModalOpen,
    setIsUploadDraftModalOpen,
    designSubmissions,
    creatorProfile,
    openAppealModal,
    showToast 
  } = useApp();

  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Demo State Switcher for Design Campaigns (Default is 'not_submitted')
  type DemoDesignerState = 'not_submitted' | 'pending' | 'needs_revision' | 'approved' | 'rejected' | 'appealing';
  const [demoState, setDemoState] = useState<DemoDesignerState>('not_submitted');

  if (!selectedCampaign) return null;

  const isDesign = selectedCampaign.campaignType === 'design';
  const designDetails = selectedCampaign.designDetails;

  // Real or simulated design submission based on demoState
  const realSubmission = designSubmissions.find(s => s.campaignId === selectedCampaign.id && s.designerId === creatorProfile.id);
  const justSubmitted = realSubmission && (realSubmission.submittedAt === 'الآن' || realSubmission.submittedAt.includes('الآن'));
  const activeState = (justSubmitted && demoState === 'not_submitted') ? 'pending' : demoState;

  const userDesignSubmission: DesignSubmission | null = activeState === 'not_submitted' 
    ? null 
    : activeState === 'pending'
      ? {
          id: realSubmission?.id || 'demo-pending-1',
          campaignId: selectedCampaign.id,
          campaignTitle: selectedCampaign.title,
          brandName: selectedCampaign.brandName,
          brandAvatar: selectedCampaign.brandAvatar,
          designerId: 'c_noura',
          designerName: 'نورة الدوسري',
          designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          designerHandle: '@noura_designs',
          submittedAt: 'أُرسل قبل ساعتين',
          status: 'pending',
          note: 'تصميم بوست وهويات الحملة',
          previewImages: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80'],
          revisionsLeft: 2,
          earnedAmount: 150,
        }
      : activeState === 'needs_revision'
        ? {
            id: realSubmission?.id || 'demo-revision-1',
            campaignId: selectedCampaign.id,
            campaignTitle: selectedCampaign.title,
            brandName: selectedCampaign.brandName,
            brandAvatar: selectedCampaign.brandAvatar,
            designerId: 'c_noura',
            designerName: 'نورة الدوسري',
            designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            designerHandle: '@noura_designs',
            submittedAt: 'أمس',
            status: 'needs_revision',
            note: 'تصميم بوست وهويات الحملة',
            brandComment: 'العمل مبهر وفكرته قوية! نرجو فقط تعديل كود لون الخلفية للأخضر الزمردي #1B4D3E وتكبير الشعار 10% أسفل البوست.',
            previewImages: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80'],
            revisionsLeft: 1,
            earnedAmount: 150,
          }
        : activeState === 'rejected'
          ? {
              id: realSubmission?.id || 'demo-rejected-1',
              campaignId: selectedCampaign.id,
              campaignTitle: selectedCampaign.title,
              brandName: selectedCampaign.brandName,
              brandAvatar: selectedCampaign.brandAvatar,
              designerId: 'c_noura',
              designerName: 'نورة الدوسري',
              designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              designerHandle: '@noura_designs',
              submittedAt: 'قبل 3 أيام',
              status: 'rejected',
              note: 'تصميم بوست وهويات الحملة',
              rejectionReason: 'المقاس المرفوع 1:1 والمطلوب بالبريف هو 4:5 مع رابط Figma بصلاحية التعديل المفتوحة.',
              previewImages: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80'],
              revisionsLeft: 0,
              earnedAmount: 150,
            }
          : demoState === 'appealing'
            ? {
                id: realSubmission?.id || 'demo-appealing-1',
                campaignId: selectedCampaign.id,
                campaignTitle: selectedCampaign.title,
                brandName: selectedCampaign.brandName,
                brandAvatar: selectedCampaign.brandAvatar,
                designerId: 'c_noura',
                designerName: 'نورة الدوسري',
                designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                designerHandle: '@noura_designs',
                submittedAt: 'قبل يومين',
                status: 'appealing',
                note: 'تصميم بوست وهويات الحملة',
                appealReason: 'العمل يطابق شروط البريف بالكامل',
                previewImages: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80'],
                revisionsLeft: 0,
                earnedAmount: 150,
              }
            : {
                id: realSubmission?.id || 'demo-approved-1',
                campaignId: selectedCampaign.id,
                campaignTitle: selectedCampaign.title,
                brandName: selectedCampaign.brandName,
                brandAvatar: selectedCampaign.brandAvatar,
                designerId: 'c_noura',
                designerName: 'نورة الدوسري',
                designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                designerHandle: '@noura_designs',
                submittedAt: 'قبل يومين',
                status: 'approved',
                note: 'تصميم بوست وهويات الحملة',
                previewImages: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80'],
                revisionsLeft: 2,
                earnedAmount: 150,
              };

  // Stats
  const budgetLeft = selectedCampaign.totalBudget - selectedCampaign.spentBudget;
  const progressPercent = Math.min(100, Math.round((selectedCampaign.spentBudget / selectedCampaign.totalBudget) * 100));

  // Design slot calculations
  const totalSlots = designDetails?.totalDesignsNeeded || 10;
  const acceptedSlots = designDetails?.acceptedDesignsCount || 3;
  const remainingSlots = Math.max(0, totalSlots - acceptedSlots);
  const pricePerDesign = designDetails?.pricePerDesign || 150;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('تم نسخ رابط الحملة إلى الحافظة!');
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    showToast(`تم نسخ كود اللون ${hex} إلى الحافظة!`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-8 max-w-[1440px] mx-auto text-right select-none">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCreatorView('discover')}
          className="flex items-center gap-2 text-xs text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع إلى اكتشف</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>مشاركة الحملة</span>
        </button>
      </div>

      {/* Hero Cover Banner with Full Width Image */}
      <div className="relative aspect-[21/9] min-h-[300px] w-full rounded-[28px] overflow-hidden border border-white/[0.14] bg-neutral-950">
        <img
          src={selectedCampaign.coverImage}
          alt={selectedCampaign.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        <div className="absolute inset-0 p-8 flex flex-col justify-end gap-3">
          {/* Brand Row */}
          <div className="flex items-center gap-3">
            <img
              src={selectedCampaign.brandAvatar}
              alt={selectedCampaign.brandName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{selectedCampaign.brandName}</span>
                {selectedCampaign.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-white fill-white/20" />
                )}
              </div>
              <span className="text-xs text-white/60">{selectedCampaign.category} · {selectedCampaign.timeAgo}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading leading-tight">
            {selectedCampaign.title}
          </h1>

          {/* Chips Row */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {/* Status Chip */}
            {selectedCampaign.requiresApplication ? (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-semibold text-amber-300">
                <Lock className="w-3 h-3" />
               <StatusBadge tone="neutral" className="text-xs! py-1!">الانضمام بطلب وموافقة</StatusBadge>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                <Check className="w-3 h-3" />
                <StatusBadge tone="success" className="text-xs! py-1!">حملة مفتوحة للجميع</StatusBadge>
              </div>
            )}

            {/* Participants Chip */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.14] text-xs text-white/90">
              <Users className="w-3 h-3 text-white/60" />
              <span>
                {selectedCampaign.participantsCount} {isDesign ? 'مصمم مشارك' : 'صانع محتوى مشارك'}
              </span>
            </div>

            {/* Payment Model Chip */}
            {isDesign ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.12] border border-white/[0.2] text-xs font-semibold text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]">
                <span>الدفع: {pricePerDesign}</span>
                <RiyalSymbol className="w-3 h-3 inline-block text-white" />
                <span>لكل تصميم مقبول</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.14] text-xs text-white/90">
                <span>الدفع: لكل 1000 مشاهدة (CPM)</span>
              </div>
            )}

            {/* Required Size Chips (for Design) OR Platform Icons (for Video) */}
            {isDesign ? (
              <>
                {(designDetails?.sizes || ['بوست 1080×1350', 'ستوري 1080×1920']).map((size) => (
                  <div 
                    key={size}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs text-white/80"
                  >
                    <LayoutTemplate className="w-3 h-3 text-white/60" />
                    <span>{size}</span>
                  </div>
                ))}

                {/* Deadline Chip: "باقي 4 أيام" */}
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300">
                  <Clock className="w-3 h-3 text-amber-400" />
                 <StatusBadge tone="warning" className="text-xs! py-1!">{designDetails?.deadline || 'باقي 4 أيام'}</StatusBadge>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/[0.14]">
                {selectedCampaign.platforms.map((p) => (
                  <div key={p} className="text-white/80" title={p}>
                    <PlatformIcon platform={p} size={12} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (8 cols on lg): Overview, Dos & Don'ts, and conditional modules */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Description */}
          <div className="p-6 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] flex flex-col gap-3">
            <h2 className="text-base font-bold text-white font-heading">عن الحملة والهدف منها</h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              {selectedCampaign.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2 pt-3 border-t border-white/[0.08]">
              <span className="text-xs text-white/60">
                {isDesign ? 'التصاميم المطلوبة:' : 'أنواع المحتوى المقبول:'}
              </span>
              {selectedCampaign.allowedTypes.map((type) => (
                <span
                  key={type}
                  className="px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-xs text-white/90"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* FOR VIDEO ONLY: Per-Platform Payout Cards (REMOVED for Design) */}
          {!isDesign && (
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-bold text-white font-heading">معدل العائد لكل منصة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedCampaign.payoutRules.map((rule) => (
                  <div
                    key={rule.platform}
                    className="p-4 rounded-[22px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                        <PlatformIcon platform={rule.platform} size={16} />
                      </div>
                      <span className="text-xs font-bold text-white capitalize">{rule.platform}</span>
                    </div>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-white font-mono tabular-nums font-heading">
                        {rule.ratePer1k}
                      </span>
                      <RiyalSymbol className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs text-[#A3A3A3]">/ 1,000 مشاهدة</span>
                    </div>

                    <div className="text-[11px] text-white/60 pt-2 border-t border-white/[0.06] flex items-center justify-between font-mono">
                      <span>أقل سحب: {rule.minPayout} <RiyalSymbol /></span>
                      <span>الحد الأعلى: {rule.maxPayout} <RiyalSymbol /></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dos and Don'ts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dos */}
            <div className="p-5 rounded-[22px] bg-white/[0.04] border border-white/[0.12] flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Check className="w-4 h-4" />
                <span>إرشادات يجب الالتزام بها</span>
              </div>
              <ul className="flex flex-col gap-2 text-xs text-white/80">
                {selectedCampaign.dos.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="p-5 rounded-[22px] bg-white/[0.04] border border-white/[0.12] flex flex-col gap-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <XIcon className="w-4 h-4" />
                <span>ممارسات يجب تجنبها</span>
              </div>
              <ul className="flex flex-col gap-2 text-xs text-white/80">
                {selectedCampaign.donts.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FOR VIDEO ONLY: Campaign Podium "أبطال الحملة" (REMOVED for Design) */}
          {!isDesign && (
            <div className="p-6 rounded-[24px] bg-white/[0.04] border border-white/[0.12] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-300" />
                  <h2 className="text-base font-bold text-white font-heading">أبطال الحملة (الأعلى أرباحاً)</h2>
                </div>
                <button
                  onClick={() => showToast('تم إنشاء بطاقة مشاركة أرباحك على سناب وتيك توك!')}
                  className="text-xs text-white/80 hover:text-white underline cursor-pointer"
                >
                  شارك بطاقتك
                </button>
              </div>

              {/* 3 Podium Cards */}
              <div className="grid grid-cols-3 gap-3 items-end pt-4">
                {/* 2nd Place */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.1] flex flex-col items-center text-center gap-2">
                  <div className="relative">
                    <img
                      src={selectedCampaign.topCreators?.[1]?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'}
                      alt="2nd"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-neutral-400"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-400 text-black text-[10px] font-black flex items-center justify-center">
                      2
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[90px]">
                    {selectedCampaign.topCreators?.[1]?.name || 'سارة المهيدب'}
                  </span>
                  <div className="flex items-baseline gap-0.5 text-xs font-bold text-white font-mono">
                    <span>{selectedCampaign.topCreators?.[1]?.earnings.toLocaleString() || '4,890'}</span>
                    <RiyalSymbol className="w-2.5 h-2.5 inline-block text-white" />
                  </div>
                </div>

                {/* 1st Place */}
                <div className="p-4 rounded-2xl bg-white/[0.07] border border-white/[0.24] shadow-[0_0_24px_rgba(255,255,255,0.12)] flex flex-col items-center text-center gap-2 -translate-y-2">
                  <div className="relative">
                    <img
                      src={selectedCampaign.topCreators?.[0]?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                      alt="1st"
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                    />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Crown className="w-5 h-5 text-amber-300 drop-shadow-md" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-black text-xs font-black flex items-center justify-center shadow-md">
                      1
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">
                    {selectedCampaign.topCreators?.[0]?.name || 'سلطان القحطاني'}
                  </span>
                  <div className="flex items-baseline gap-0.5 text-sm font-extrabold text-white font-mono">
                    <span>{selectedCampaign.topCreators?.[0]?.earnings.toLocaleString() || '6,240'}</span>
                    <RiyalSymbol className="w-3 h-3 inline-block text-white" />
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.1] flex flex-col items-center text-center gap-2">
                  <div className="relative">
                    <img
                      src={selectedCampaign.topCreators?.[2]?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'}
                      alt="3rd"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-neutral-600"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-600 text-white text-[10px] font-black flex items-center justify-center">
                      3
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[90px]">
                    {selectedCampaign.topCreators?.[2]?.name || 'خالد الزهراني'}
                  </span>
                  <div className="flex items-baseline gap-0.5 text-xs font-bold text-white font-mono">
                    <span>{selectedCampaign.topCreators?.[2]?.earnings.toLocaleString() || '3,410'}</span>
                    <RiyalSymbol className="w-2.5 h-2.5 inline-block text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col (4 cols on lg): Sticky Actions & Specifications & Reference Materials */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Main Action Box */}
          <div className="p-6 rounded-[26px] bg-white/[0.05] backdrop-blur-2xl border border-white/[0.16] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,255,255,0.06)] flex flex-col gap-4">
            {/* Rate Header */}
            {isDesign ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A3A3A3]">مكافأة العمل</span>
                <div className="flex items-baseline gap-1 text-xl font-bold text-white font-mono">
                  <span>{pricePerDesign}</span>
                  <RiyalSymbol className="w-4 h-4 text-white inline-block" />
                  <span className="text-xs text-neutral-400">/ لكل تصميم</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A3A3A3]">معدل الحملة</span>
                <div className="flex items-baseline gap-1 text-xl font-bold text-white font-mono">
                  <span>{selectedCampaign.ratePer1k}</span>
                  <RiyalSymbol className="w-4 h-4 text-white inline-block" />
                  <span className="text-xs text-neutral-400">/ 1K</span>
                </div>
              </div>
            )}

            {/* Action Buttons / Designer Current Submission State */}
            {isDesign ? (
              userDesignSubmission ? (
                /* Show current status of designer submission */
                <div className="flex flex-col gap-2.5">
                  {userDesignSubmission.status === 'pending' && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>تصميمك قيد المراجعة</span>
                        </div>
                        <span className="text-[10px] text-amber-300/80 font-mono">أُرسل قبل ساعتين</span>
                      </div>
                      
                      {/* Thumbnail with Watermark Overlay */}
                      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-white/10 bg-neutral-900 group">
                        <img 
                          src={userDesignSubmission.previewImages?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80'} 
                          alt="معاينة التصميم" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
                          <span className="text-[11px] font-bold text-white/70 -rotate-12 border border-white/20 px-3 py-1 rounded uppercase tracking-wider bg-black/60 shadow-lg">
                            معاينة محمية بعلامة مائية
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        تشاهد العلامة التجارية نسختك بعلامة مائية، وعند القبول يُضاف 150 <RiyalSymbol /> مباشرة إلى محفظتك.
                      </p>
                    </div>
                  )}

                  {userDesignSubmission.status === 'needs_revision' && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/[0.12] border border-amber-500/40 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>يحتاج إلى تعديل</span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-300/90 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          جولات التعديل المتبقية: {userDesignSubmission.revisionsLeft}
                        </span>
                      </div>
                      {userDesignSubmission.brandComment && (
                        <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 flex flex-col gap-1">
                          <span className="text-[10px] text-white/50 font-semibold">ملاحظة العلامة التجارية:</span>
                          <p className="text-[11px] text-white/90 leading-relaxed">
                            {userDesignSubmission.brandComment}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => setIsSubmitClipModalOpen(true)}
                        className="w-full py-2.5 px-4 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_16px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-0.5"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>ارفع النسخة المعدّلة</span>
                      </button>
                    </div>
                  )}

                  {userDesignSubmission.status === 'approved' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>مقبول ومطابق — انصرف {userDesignSubmission.earnedAmount || 150} <RiyalSymbol /></span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        تم اعتماد التصميم رسميًا ونقل ملكيته للبراند وإضافة الرصيد إلى محفظتك.
                      </p>
                    </div>
                  )}

                  {userDesignSubmission.status === 'rejected' && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>مرفوض</span>
                      </div>
                      {userDesignSubmission.rejectionReason && (
                        <div className="p-2.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 text-[11px] text-rose-200/90 leading-relaxed">
                          <span className="font-semibold text-rose-300">السبب: </span>
                          {userDesignSubmission.rejectionReason}
                        </div>
                      )}
                      <button
                        onClick={() => openAppealModal({ type: 'design', item: userDesignSubmission })}
                        className="w-full py-2 px-3 rounded-full bg-white/[0.1] hover:bg-white/[0.18] border border-white/20 text-xs text-white font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-0.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>اعتراض على القرار</span>
                      </button>
                    </div>
                  )}

                  {userDesignSubmission.status === 'appealing' && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>قيد الاعتراض</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        اعتراضك قيد المراجعة لدى فريق النزاعات المستقل (الرد خلال 3 أيام عمل).
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Primary White Button for Design: "ارفع تصميمك" */
                <button
                  onClick={() => setIsSubmitClipModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:shadow-[0_0_36px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>ارفع تصميمك</span>
                </button>
              )
            ) : (
              /* Video Campaign Buttons */
              selectedCampaign.requiresApplication ? (
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:shadow-[0_0_36px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>قدّم على الحملة (موافقة مسبقة)</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setIsSubmitClipModalOpen(true)}
                    className="w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:shadow-[0_0_36px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>أرسل مقطع (رابط مباشر)</span>
                  </button>
                  <button
                    onClick={() => setIsUploadDraftModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-xs font-semibold text-white transition-all text-center cursor-pointer"
                  >
                    رفع مسودة قبل النشر
                  </button>
                </div>
              )
            )}

            {/* Capacity / Budget Status Box */}
            {isDesign ? (
              /* Segmented Progress Bar for Design: "التصاميم المقبولة: 3 من 10" + "باقي 7 أماكن" */
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col gap-3 mt-1">
                <div className="flex items-center justify-between text-xs text-white">
                  <span className="font-semibold">
                    التصاميم المقبولة: {acceptedSlots} من {totalSlots}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {remainingSlots} مقاعد متبقية
                  </span>
                </div>

                {/* Segmented progress bar (one segment per slot) */}
                <div className="grid grid-cols-10 gap-1.5 w-full">
                  {Array.from({ length: totalSlots }).map((_, idx) => {
                    const isFilled = idx < acceptedSlots;
                    return (
                      <div
                        key={idx}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          isFilled
                            ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]'
                            : 'bg-white/[0.12] border border-white/[0.1]'
                        }`}
                        title={isFilled ? `مقبول (${idx + 1})` : `مقعد متاح (${idx + 1})`}
                      />
                    );
                  })}
                </div>

                <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                  تكتمل الحملة تلقائياً بمجرد اعتماد {totalSlots} تصاميم مطابقة لمعايير العلامة التجارية.
                </p>
              </div>
            ) : (
              /* Video Budget Status */
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>الميزانية المستهلكة</span>
                  <span className="font-mono font-bold text-white">{progressPercent}%</span>
                </div>

                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] pt-1">
                  <div className="flex items-baseline gap-1">
                    <span>تم صرف:</span>
                    <span className="text-white font-mono">{selectedCampaign.spentBudget.toLocaleString()}</span>
                    <RiyalSymbol className="w-2.5 h-2.5 text-white/70" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span>الإجمالي:</span>
                    <span className="text-white font-mono">{selectedCampaign.totalBudget.toLocaleString()}</span>
                    <RiyalSymbol className="w-2.5 h-2.5 text-white/70" />
                  </div>
                </div>

                <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                  متبقٍّ {budgetLeft.toLocaleString()} <RiyalSymbol /> — ما زال بإمكانك الانضمام وتحقيق أرباحك!
                </p>
              </div>
            )}
          </div>

          {/* FOR DESIGN ONLY: "المواصفات المطلوبة" Card */}
          {isDesign && (
            <div className="p-5 rounded-[24px] bg-white/[0.04] border border-white/[0.12] flex flex-col gap-3.5">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-white/80" />
                <h3 className="text-xs font-bold text-white font-heading">المواصفات المطلوبة</h3>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                {/* Sizes */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-white/60">المقاسات المعتمدة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(designDetails?.sizes || ['بوست 1080×1350', 'ستوري 1080×1920']).map((size) => (
                      <span key={size} className="px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-white/90 font-mono text-[11px]">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Delivery Formats */}
                <div className="flex flex-col gap-1 pt-1.5 border-t border-white/[0.06]">
                  <span className="text-[11px] text-white/60">صيغ التسليم الإلزامية:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(designDetails?.formats || ['PNG عالي الدقة', 'ملف PSD', 'رابط Figma']).map((format) => (
                      <span key={format} className="px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-white/90 text-[11px]">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Revision Rounds & Single Designer Rule */}
                <div className="flex flex-col gap-1 pt-1.5 border-t border-white/[0.06] text-[11px] text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">جولات التعديل المسموحة:</span>
                    <span className="font-bold text-white">{designDetails?.revisionRoundsAllowed ?? 2} جولات</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-300 mt-1">
                    <span>قاعدة المشاركة:</span>
                    <span className="font-bold">تصميم واحد لكل مصمم</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reference Materials & Brand Kit */}
          <div className="p-5 rounded-[24px] bg-white/[0.04] border border-white/[0.12] flex flex-col gap-3.5">
            <h3 className="text-xs font-bold text-white font-heading">
              {isDesign ? 'المواد المرجعية وملفات الهوية (Brand Kit)' : 'المواد المرجعية والملفات'}
            </h3>

            {/* If Design: Brand Kit Interactive Downloads & Swatches */}
            {isDesign ? (
              <div className="flex flex-col gap-3">
                {/* Brand Colors Swatches with click to copy */}
                {designDetails?.brandColors && designDetails.brandColors.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-white/60">ألوان الهوية الرسمية (انقر للنسخ):</span>
                    <div className="flex items-center gap-2">
                      {designDetails.brandColors.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => handleCopyColor(hex)}
                          className="group relative flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:border-white/40 transition-all cursor-pointer"
                          title={`نسخ كود ${hex}`}
                        >
                          <div 
                            className="w-4 h-4 rounded-full ring-1 ring-white/30"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="font-mono text-[10px] text-white/80 group-hover:text-white">
                            {hex}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand Fonts */}
                {designDetails?.brandFonts && (
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-white/[0.06]">
                    <span className="text-[11px] text-white/60">خطوط الهوية:</span>
                    <span className="text-xs text-white/90 font-medium">
                      {designDetails.brandFonts}
                    </span>
                  </div>
                )}

                {/* Exact Copy / Campaign Text */}
                {designDetails?.exactCopy && (
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-white/[0.06]">
                    <span className="text-[11px] text-white/60">النص المعتمد للتصميم (Exact Copy):</span>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white/90 font-medium leading-relaxed">
                      "{designDetails.exactCopy}"
                    </div>
                  </div>
                )}

                {/* Product Photos Download Preview */}
                {designDetails?.productPhotoUrls && designDetails.productPhotoUrls.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/60">صور المنتجات عالية الدقة (4K):</span>
                      <button
                        onClick={() => showToast('تم بدء تحميل حزمة صور المنتجات عالية الدقة (ZIP)...')}
                        className="text-white hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>تحميل الكل (ZIP)</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {designDetails.productPhotoUrls.map((url, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 group relative">
                          <img src={url} alt={`Product ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reference Links & Downloads */}
                <div className="flex flex-col gap-2 pt-1 border-t border-white/[0.06]">
                  {selectedCampaign.referenceLinks?.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between text-xs text-white/90"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-white/60" />
                        <span>{ref.title}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              /* Video Campaign Reference Materials */
              <div className="flex flex-col gap-2">
                {selectedCampaign.referenceLinks?.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between text-xs text-white/90"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-white/60" />
                      <span>{ref.title}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Demo State Switcher for Design Campaigns */}
      {isDesign && (
        <div className="fixed bottom-6 left-6 z-40 bg-[#121212]/95 backdrop-blur-2xl border border-white/20 p-2 sm:p-2.5 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_24px_rgba(255,255,255,0.08)] flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 text-white/70 font-semibold shrink-0">
            <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] hidden sm:inline">وضع العرض التجريبي:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'not_submitted', label: 'لم يُرسل بعد' },
              { id: 'pending', label: 'بانتظار المراجعة' },
              { id: 'needs_revision', label: 'يحتاج إلى تعديل' },
              { id: 'approved', label: 'مقبول' },
              { id: 'rejected', label: 'مرفوض' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setDemoState(st.id as any);
                  showToast(`تم تبديل حالة المصمم إلى: ${st.label}`);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  demoState === st.id
                    ? 'bg-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetailView;
