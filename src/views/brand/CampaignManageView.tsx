import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import PlatformIcon from '../../components/PlatformIcon';
import StatusBadge from '../../components/common/StatusBadge';
import { Submission, DraftItem, ApplicationItem } from '../../types';
import {
  ArrowRight,
  Check,
  X as XIcon,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ExternalLink,
  Film,
  Send,
  Eye,
  Users,
  Layers,
  Settings,
  Wallet,
  TrendingUp,
  PauseCircle,
  PlayCircle,
  PlusCircle,
  ChevronLeft
} from 'lucide-react';
import DesignCampaignManage from './DesignCampaignManage';

export const CampaignManageView: React.FC = () => {
  const { 
    selectedCampaign, 
    setBrandView, 
    submissions, 
    drafts, 
    applications,
    approveSubmission,
    approveApplication,
    rejectApplication,
    setSelectedSubmission,
    setIsRejectModalOpen,
    showToast,
    setIsFundModalOpen,
    toggleCampaignPause
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'drafts' | 'applications' | 'creators'>('overview');
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const isPaused = selectedCampaign?.status === 'paused';

  if (!selectedCampaign) return null;

  // Render Design Campaign Management UI for design campaigns
  if (selectedCampaign.campaignType === 'design') {
    return <DesignCampaignManage />;
  }

  const currentSubmission: Submission | undefined = submissions[selectedSubIndex] || submissions[0];

  const handleApproveCurrent = () => {
    if (currentSubmission) {
      approveSubmission(currentSubmission.id);
    }
  };

  const handleRejectCurrent = () => {
    if (currentSubmission) {
      setSelectedSubmission(currentSubmission);
      setIsRejectModalOpen(true);
    }
  };

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      {/* Top Breadcrumb & Campaign Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBrandView('campaigns')}
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white font-heading">{selectedCampaign.title}</h1>
              {isPaused ? (
                <StatusBadge tone="danger">موقوفة</StatusBadge>
              ) : (
                <StatusBadge tone="success">نشطة</StatusBadge>
              )}
            </div>
            <span className="text-xs text-[#A3A3A3] mt-0.5">
              ميزانية: {selectedCampaign.totalBudget.toLocaleString()} <RiyalSymbol /> · تم صرف: {selectedCampaign.spentBudget.toLocaleString()} <RiyalSymbol /> · معدل: {selectedCampaign.ratePer1k} <RiyalSymbol /> / 1K
            </span>
          </div>
        </div>

        {/* 7-day Review countdown badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>مهلة تدقيق المقاطع: 7 أيام للموافقة</span>
        </div>
      </div>

      {/* Tabs Row: المقاطع / المسودات / الطلبات / صناع المحتوى / الإعدادات */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit overflow-x-auto">
        {[
          { id: 'overview', label: 'نظرة عامة', count: null },
          { id: 'submissions', label: 'المقاطع المرسلة', count: submissions.length },
          { id: 'drafts', label: 'المسودات للموافقة', count: drafts.length },
          { id: 'applications', label: 'طلبات الانضمام', count: applications.length },
          { id: 'creators', label: 'صناع المحتوى النشطين', count: new Set(submissions.map((s) => s.linkedAccountHandle)).size },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id ? 'bg-neutral-200 text-black' : 'bg-white/10 text-white'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 0: نظرة عامة على الحملة (الميزانية والأداء) */}
      {activeTab === 'overview' && (() => {
        const total = selectedCampaign.totalBudget;
        const spent = selectedCampaign.spentBudget;
        const remaining = Math.max(0, total - spent);
        const spentPercent = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
        const totalViews = submissions.reduce((sum, s) => sum + (s.views || 0), 0);
        const pendingClips = submissions.filter((s) => s.status === 'pending').length;
        const pendingDrafts = drafts.filter((d) => d.status === 'pending').length;
        const approvedClips = submissions.filter((s) => s.status === 'approved').length;
        const effectiveCpm = totalViews > 0 ? spent / (totalViews / 1000) : 0;
        const viewsLeft = selectedCampaign.ratePer1k > 0 ? Math.round((remaining / selectedCampaign.ratePer1k) * 1000) : 0;
        const topClips = [...submissions]
          .filter((s) => s.status === 'approved')
          .sort((a, b) => b.views - a.views)
          .slice(0, 3);

        return (
          <div className="flex flex-col gap-6">
            {/* تنبيه: عناصر بانتظار قرارك */}
            {(pendingClips > 0 || pendingDrafts > 0) && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[24px] bg-amber-500/[0.06] border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">لديك عناصر بانتظار قرارك</span>
                    <span className="text-xs text-white/60 mt-0.5">
                      {pendingClips} مقاطع بانتظار التدقيق · {pendingDrafts} مسودات بانتظار الموافقة
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pendingDrafts > 0 && (
                    <button
                      onClick={() => setActiveTab('drafts')}
                      className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-xs font-semibold text-white transition-all cursor-pointer"
                    >
                      راجع المسودات
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className="white-glow-button px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>راجع المقاطع الآن</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* بطاقة الميزانية (8 أعمدة) */}
              <div className="lg:col-span-8 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-white/70" />
                    <span className="text-sm font-bold text-white">ميزانية الحملة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        toggleCampaignPause(selectedCampaign.id);
                        showToast(isPaused ? 'تم استئناف الحملة وعادت لاستقبال المقاطع' : 'تم إيقاف الحملة مؤقتاً ولن تستقبل مقاطع جديدة');
                      }}
                      className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isPaused
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400'
                      }`}
                    >
                      {isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'استئناف الحملة' : 'إيقاف مؤقت'}</span>
                    </button>
                    <button
                      onClick={() => setIsFundModalOpen(true)}
                      className="white-glow-button px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>زيادة الميزانية</span>
                    </button>
                  </div>
                </div>

                {/* الأرقام الثلاثة */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'الميزانية الإجمالية', value: total, tone: 'text-white' },
                    { label: 'المصروف', value: spent, tone: 'text-white' },
                    { label: 'المتبقي', value: remaining, tone: 'text-emerald-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-1.5">
                      <span className="text-[11px] text-white/50">{item.label}</span>
                      <span className={`text-2xl font-bold font-heading flex items-center gap-1.5 ${item.tone}`}>
                        <RiyalSymbol className="w-5 h-5" />
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* شريط استهلاك الميزانية */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">نسبة استهلاك الميزانية</span>
                    <span className="font-mono font-bold text-white">{spentPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-all duration-700"
                      style={{ width: `${spentPercent}%` }}
                    />
                  </div>
                  {viewsLeft > 0 && (
                    <span className="text-[11px] text-emerald-400/90">
                      المتبقي يغطي قرابة {viewsLeft.toLocaleString()} مشاهدة قادمة
                    </span>
                  )}
                </div>
              </div>

              {/* مؤشرات الأداء (4 أعمدة) */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                {[
                  { icon: Eye, label: 'إجمالي المشاهدات', value: totalViews.toLocaleString() },
                  { icon: Users, label: 'صناع المحتوى', value: selectedCampaign.participantsCount.toLocaleString() },
                  { icon: Film, label: 'مقاطع معتمدة', value: approvedClips.toLocaleString() },
                  { icon: TrendingUp, label: 'التكلفة الفعلية / 1K', value: effectiveCpm.toFixed(2), riyal: true },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[22px] bg-white/[0.04] border border-white/[0.12] p-4 flex flex-col gap-2"
                  >
                    <stat.icon className="w-4 h-4 text-white/60" />
                    <span className="text-[11px] text-white/50">{stat.label}</span>
                    <span className="text-lg font-bold font-heading text-white flex items-center gap-1">
                      {stat.riyal && <RiyalSymbol className="w-4 h-4" />}
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* أفضل المقاطع أداءً */}
            <div className="rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">أفضل المقاطع أداءً</span>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className="text-xs text-white/60 hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  عرض جميع المقاطع
                </button>
              </div>
              {topClips.length === 0 ? (
                <div className="py-10 text-center text-xs text-white/50">لا توجد مقاطع معتمدة حتى الآن</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topClips.map((clip, i) => (
                    <div
                      key={clip.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]"
                    >
                      <span className="text-2xl font-black font-heading text-white/30 w-6 text-center">{i + 1}</span>
                      <img src={clip.thumbnail} alt="" className="w-12 h-16 rounded-xl object-cover" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{clip.linkedAccountHandle}</span>
                        <span className="text-[11px] text-white/50">{clip.views.toLocaleString()} مشاهدة</span>
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <RiyalSymbol className="w-3 h-3" />
                          {clip.earnings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Tab 1: Submission Review (Queue + Large Preview Panel) */}
      {activeTab === 'submissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Queue List (4 cols) */}
          <div className="lg:col-span-4 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 px-1">
              <span className="text-xs font-bold text-white">قائمة الانتظار للتدقيق</span>
              <span className="text-[11px] text-white/50">{submissions.length} مقاطع</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
              {submissions.map((sub, idx) => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubIndex(idx)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedSubIndex === idx
                      ? 'bg-white/[0.1] border-white/30 shadow-[0_0_16px_rgba(255,255,255,0.06)]'
                      : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
                  }`}
                >
                  <img
                    src={sub.thumbnail}
                    alt="thumbnail"
                    className="w-12 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{sub.linkedAccountHandle}</span>
                      <PlatformIcon platform={sub.platform} size={12} className="text-white/70" />
                    </div>
                    <span className="text-[10px] text-[#A3A3A3] mt-0.5">{sub.views.toLocaleString()} مشاهدة</span>
                    <div className="mt-1">
                      {sub.status === 'approved' ? (
                        <StatusBadge tone="success">معتمد</StatusBadge>
                      ) : sub.status === 'rejected' ? (
                        <StatusBadge tone="danger">مرفوض</StatusBadge>
                      ) : (
                        <StatusBadge tone="warning" pulse>بانتظار قرارك</StatusBadge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Large Preview Panel (8 cols) */}
          {currentSubmission && (
            <div className="lg:col-span-8 rounded-[28px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.14] p-6 flex flex-col gap-6">
              {/* Top sub info */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                    <PlatformIcon platform={currentSubmission.platform} size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-mono">{currentSubmission.linkedAccountHandle}</h2>
                    <span className="text-xs text-[#A3A3A3]">تاريخ الرفع: {currentSubmission.submittedAt}</span>
                  </div>
                </div>

                <a
                  href={currentSubmission.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs text-white hover:bg-white/[0.1] transition-colors"
                >
                  <span>فتح الرابط الأصلي</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Middle: Video Preview & Bot Score Meter */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* 9:16 Vertical Video Preview (5 cols) */}
                <div className="sm:col-span-5 aspect-[9/16] max-h-[380px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/[0.1] relative mx-auto">
                  <img
                    src={currentSubmission.thumbnail}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Film className="w-10 h-10 text-white/80" />
                  </div>
                </div>

                {/* Checklist & Bot Score Meter (7 cols) */}
                <div className="sm:col-span-7 flex flex-col gap-5">
                  {/* Bot Score Meter 0-100 */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>مقياس نزاهة المشاهدات (Bot Score)</span>
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-400">
                        {currentSubmission.botScore}% روبوتات (طبيعي جداً)
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${Math.max(5, currentSubmission.botScore)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-white/50">
                      تم فحص سرعة تدفق المشاهدات، والتعليقات، وموقع المستخدمين الجغرافي.
                    </span>
                  </div>

                  {/* Campaign Rules Checklist */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-white/80">فحص شروط الحملة:</span>
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Check className="w-4 h-4" />
                        <span>ظهور المنتج في أول 3 ثواني: متحقق ✓</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Check className="w-4 h-4" />
                        <span>كود الخصم في الكابشن: موجود ✓</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Check className="w-4 h-4" />
                        <span>استخدام الصوت المعتمد: مطابق ✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Earnings to disburse */}
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-between text-xs">
                    <span className="text-white/60">المستحقات المحسوبة للمقطع:</span>
                    <div className="flex items-baseline gap-1 font-bold text-white font-mono text-sm">
                      <span>{currentSubmission.earnings.toLocaleString()}</span>
                      <RiyalSymbol className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleApproveCurrent}
                      className="flex-1 py-3 px-6 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>اعتماد المقطع وصرف المستحقات</span>
                    </button>

                    <button
                      onClick={handleRejectCurrent}
                      className="py-3 px-6 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XIcon className="w-4 h-4" />
                      <span>رفض المقطع</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Drafts Review */}
      {activeTab === 'drafts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drafts.map((d) => (
            <div key={d.id} className="p-5 rounded-[24px] bg-white/[0.04] border border-white/[0.12] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{d.title}</span>
                <StatusBadge tone="warning" pulse>بانتظار القرار</StatusBadge>
              </div>
              <p className="text-xs text-[#A3A3A3]">{d.notes}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => showToast('تمت الموافقة على مسودة الفيديو، أُشعر الصانع بإمكانية النشر المباشر')}
                  className="flex-1 py-2 rounded-full bg-white text-black font-bold text-xs shadow-sm cursor-pointer"
                >
                  اعتماد المسودة
                </button>
                <button
                  onClick={() => showToast('تم إرسال طلب التعديل')}
                  className="flex-1 py-2 rounded-full bg-white/[0.08] text-white text-xs font-semibold cursor-pointer"
                >
                  طلب تعديل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Applications Review */}
      {activeTab === 'applications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <div key={app.id} className="p-5 rounded-[24px] bg-white/[0.04] border border-white/[0.12] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img src={app.creatorAvatar} alt={app.creatorName} className="w-12 h-12 rounded-full object-cover ring-1 ring-white/20" />
                <div>
                  <h3 className="text-sm font-bold text-white">{app.creatorName}</h3>
                  <span className="text-xs text-[#A3A3A3] font-mono">{app.creatorHandle} · {app.pastViews}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-white/80 leading-relaxed">
                <span className="block font-bold text-white mb-1">سبب التقديم:</span>
                {app.motivation}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => approveApplication(app.id)}
                  className="flex-1 py-2 rounded-full bg-white text-black font-bold text-xs shadow-sm cursor-pointer"
                >
                  قبول الصانع
                </button>
                <button
                  onClick={() => rejectApplication(app.id)}
                  className="flex-1 py-2 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20 cursor-pointer"
                >
                  رفض الطلب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: صناع المحتوى النشطين */}
      {activeTab === 'creators' && (() => {
        const creatorsMap = new Map<string, {
          handle: string;
          platforms: Set<string>;
          clips: number;
          approved: number;
          pending: number;
          views: number;
          earnings: number;
          thumbnail: string;
        }>();
        submissions.forEach((s) => {
          const key = s.linkedAccountHandle;
          const c = creatorsMap.get(key) || {
            handle: key, platforms: new Set<string>(), clips: 0, approved: 0, pending: 0, views: 0, earnings: 0, thumbnail: s.thumbnail,
          };
          c.platforms.add(s.platform);
          c.clips += 1;
          c.views += s.views || 0;
          if (s.status === 'approved') { c.approved += 1; c.earnings += s.earnings || 0; }
          if (s.status === 'pending') c.pending += 1;
          creatorsMap.set(key, c);
        });
        const creatorsList = Array.from(creatorsMap.values()).sort((a, b) => b.views - a.views);

        return (
          <div className="rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
              <span className="text-sm font-bold text-white">صناع المحتوى المشاركون في الحملة</span>
              <span className="text-[11px] text-white/50">{creatorsList.length} حسابات</span>
            </div>
            {creatorsList.length === 0 ? (
              <div className="py-16 text-center text-xs text-white/50">لم يرسل أي صانع محتوى مقاطع لهذه الحملة بعد</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="text-white/50 border-b border-white/[0.06]">
                      <th className="p-4 font-medium">صانع المحتوى</th>
                      <th className="p-4 font-medium">المنصات</th>
                      <th className="p-4 font-medium">المقاطع</th>
                      <th className="p-4 font-medium">المشاهدات</th>
                      <th className="p-4 font-medium">المستحقات المصروفة</th>
                      <th className="p-4 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creatorsList.map((c) => (
                      <tr key={c.handle} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={c.thumbnail} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20" />
                            <span className="font-bold text-white">{c.handle}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            {Array.from(c.platforms).map((p) => (
                              <PlatformIcon key={p} platform={p as any} className="w-4 h-4 text-white/70" />
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-white/80">
                          {c.clips} <span className="text-white/40">({c.approved} معتمدة)</span>
                        </td>
                        <td className="p-4 font-mono text-white">{c.views.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="font-mono text-emerald-400 flex items-center gap-1">
                            <RiyalSymbol className="w-3 h-3" />
                            {c.earnings.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          {c.pending > 0 ? (
                            <StatusBadge tone="warning" pulse>{c.pending} بانتظار التدقيق</StatusBadge>
                          ) : (
                            <StatusBadge tone="success">نشط</StatusBadge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default CampaignManageView;
