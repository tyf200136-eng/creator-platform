import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import PlatformIcon from '../../components/PlatformIcon';
import StatusBadge from '../../components/common/StatusBadge';
import { SubmissionStatus, DesignSubmissionStatus, Submission, DesignSubmission, Campaign } from '../../types';
import {
  ExternalLink,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  PenTool,
  Send,
  Eye,
  FileText,
  LayoutGrid,
  List,
  HelpCircle,
  MessageSquare,
  X as XIcon
} from 'lucide-react';

export const SubmissionsView: React.FC = () => {
  const { 
    submissions, 
    designSubmissions, 
    setIsSubmitClipModalOpen, 
    openAppealModal,
    setSelectedCampaign,
    campaigns,
    resolveAppeal,
    showToast 
  } = useApp();

  // Top Tabs: المقاطع (لكل 1000 مشاهدة) vs التصاميم (مبلغ لكل تصميم)
  const [mainTab, setMainTab] = useState<'clips' | 'designs'>('clips');
  
  // Status Filter: الكل / مقبول / قيد المراجعة / مرفوض / قيد الاعتراض (+ يحتاج تعديل for designs)
  const [statusTab, setStatusTab] = useState<string>('all');

  // Campaign Picker Modal for "+ إرسال عمل جديد"
  const [isCampaignPickerOpen, setIsCampaignPickerOpen] = useState<boolean>(false);

  // Handle uploading new work: asks user to select campaign first
  const handleUploadNewWork = () => {
    setIsCampaignPickerOpen(true);
  };

  const handleSelectCampaignToSubmit = (camp: Campaign) => {
    setSelectedCampaign(camp);
    setIsCampaignPickerOpen(false);
    setIsSubmitClipModalOpen(true);
  };

  // Filter video submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'approved') return sub.status === 'approved' || sub.status === 'appeal_approved';
    if (statusTab === 'pending') return sub.status === 'pending';
    if (statusTab === 'rejected') return sub.status === 'rejected';
    if (statusTab === 'appealing') return sub.status === 'appealing';
    return sub.status === statusTab;
  });

  // Filter design submissions
  const filteredDesignSubmissions = designSubmissions.filter((des) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'approved') return des.status === 'approved' || des.status === 'appeal_approved';
    if (statusTab === 'pending') return des.status === 'pending';
    if (statusTab === 'needs_revision') return des.status === 'needs_revision';
    if (statusTab === 'rejected') return des.status === 'rejected';
    if (statusTab === 'appealing') return des.status === 'appealing';
    return des.status === statusTab;
  });

  const handleOpenRevisionModal = (des: DesignSubmission) => {
    const camp = campaigns.find(c => c.id === des.campaignId);
    if (camp) setSelectedCampaign(camp);
    setIsSubmitClipModalOpen(true);
  };

  const getVideoStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'approved':        return <StatusBadge tone="success">مقبول ومطابق</StatusBadge>;
      case 'pending':         return <StatusBadge tone="warning">قيد المراجعة</StatusBadge>;
      case 'rejected':        return <StatusBadge tone="danger">مرفوض</StatusBadge>;
      case 'appealing':       return <StatusBadge tone="warning">قيد الاعتراض</StatusBadge>;
      case 'appeal_approved': return <StatusBadge tone="success">تم قبول الاعتراض</StatusBadge>;
      case 'appeal_rejected': return <StatusBadge tone="danger">تم رفض الاعتراض</StatusBadge>;
      default:                return <StatusBadge tone="neutral">السجل</StatusBadge>;
    }
  };

  const getDesignStatusBadge = (des: DesignSubmission) => {
    switch (des.status) {
      case 'approved':        return <StatusBadge tone="success">مقبول</StatusBadge>;
      case 'needs_revision':  return <StatusBadge tone="warning" pulse>يحتاج تعديل</StatusBadge>;
      case 'pending':         return <StatusBadge tone="warning">بانتظار المراجعة</StatusBadge>;
      case 'rejected':        return <StatusBadge tone="danger">مرفوض</StatusBadge>;
      case 'appealing':       return <StatusBadge tone="warning">قيد الاعتراض</StatusBadge>;
      case 'appeal_approved': return <StatusBadge tone="success">تم قبول الاعتراض</StatusBadge>;
      case 'appeal_rejected': return <StatusBadge tone="danger">تم رفض الاعتراض</StatusBadge>;
      default:                return null;
    }
  };

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      {/* Page Header (Renamed: أعمالي) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">أعمالي</h1>
          <p className="text-xs text-muted mt-1">
            جميع المقاطع والتصاميم التي أرسلتها وحالتها
          </p>
        </div>

        {/* Top button: "+ إرسال عمل جديد" */}
        <button
          onClick={handleUploadNewWork}
          className="py-2.5 px-6 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:shadow-[0_0_28px_rgba(255,255,255,0.6)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>+ إرسال عمل جديد</span>
        </button>
      </div>

      {/* Top Tabs: "المقاطع (لكل 1000 مشاهدة)" and "التصاميم (مبلغ لكل تصميم)" */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.06] border border-white/[0.1]">
          <button
            onClick={() => {
              setMainTab('clips');
              if (statusTab === 'needs_revision') setStatusTab('all');
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mainTab === 'clips'
                ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>المقاطع (لكل 1000 مشاهدة)</span>
          </button>
          <button
            onClick={() => {
              setMainTab('designs');
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mainTab === 'designs'
                ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>التصاميم (مبلغ لكل تصميم)</span>
          </button>
        </div>

        {/* Status Filter Chips:
            Videos: الكل / مقبول / قيد المراجعة / مرفوض / قيد الاعتراض
            Designs: الكل / مقبول / قيد المراجعة / يحتاج تعديل / مرفوض / قيد الاعتراض */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(mainTab === 'clips' ? [
            { id: 'all', label: 'الكل' },
            { id: 'approved', label: 'مقبول' },
            { id: 'pending', label: 'قيد المراجعة' },
            { id: 'rejected', label: 'مرفوض' },
            { id: 'appealing', label: 'قيد الاعتراض' },
          ] : [
            { id: 'all', label: 'الكل' },
            { id: 'approved', label: 'مقبول' },
            { id: 'pending', label: 'قيد المراجعة' },
            { id: 'needs_revision', label: 'يحتاج تعديل' },
            { id: 'rejected', label: 'مرفوض' },
            { id: 'appealing', label: 'قيد الاعتراض' },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                statusTab === tab.id
                  ? 'bg-white/[0.15] border-white/40 text-white font-bold shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                  : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: VIDEOS TABLE (Keep current table exactly + Working Appeal)
          ========================================================================= */}
      {mainTab === 'clips' ? (
        <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-white/50 text-[11px] font-semibold">
                  <th className="py-3.5 px-4">المقطع والحملة</th>
                  <th className="py-3.5 px-4">المنصة والحساب</th>
                  <th className="py-3.5 px-4 text-center">المشاهدات المعتمدة</th>
                  <th className="py-3.5 px-4 text-center">الأرباح المكتسبة</th>
                  <th className="py-3.5 px-4 text-center">فحص الروبوتات (Bot Score)</th>
                  <th className="py-3.5 px-4 text-center">الحالة والإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-white/40 text-xs">
                      لا توجد مقاطع مطابقة للفلاتر المحددة.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <React.Fragment key={sub.id}>
                      <tr className="hover:bg-white/[0.03] transition-colors">
                        {/* Thumbnail & Title */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={sub.thumbnail}
                              alt={sub.campaignTitle}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 grayscale hover:grayscale-0 transition-all border border-white/10"
                            />
                            <div className="flex flex-col min-w-0 max-w-xs">
                              <span className="font-bold text-white truncate">{sub.campaignTitle}</span>
                              <span className="text-[11px] text-muted">{sub.brandName} · {sub.submittedAt}</span>
                              <a
                                href={sub.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 mt-0.5"
                              >
                                <span>رابط الفيديو</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Platform & Account */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                              <PlatformIcon platform={sub.platform} size={12} />
                            </div>
                            <span className="font-mono text-white/90">{sub.linkedAccountHandle}</span>
                          </div>
                        </td>

                        {/* Views */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-white tabular-nums">
                            {sub.views.toLocaleString()}
                          </span>
                        </td>

                        {/* Earnings */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-baseline justify-center gap-1 font-mono font-bold text-white tabular-nums">
                            <span>{sub.earnings.toLocaleString()}</span>
                            <RiyalSymbol className="w-3 h-3 text-white inline-block" />
                          </div>
                        </td>

                        {/* Bot Score */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] text-[11px] font-mono">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>{sub.botScore}% موثوق</span>
                          </div>
                        </td>

                        {/* Status Pill & Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            {getVideoStatusBadge(sub.status)}

                            {sub.status === 'appealing' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/15 text-white/50 text-[10px] font-medium cursor-not-allowed">
                                قيد المراجعة الإدارية
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* If Rejected: Show reason + Working Appeal button */}
                      {sub.status === 'rejected' && (
                        <tr className="bg-rose-500/[0.04]">
                          <td colSpan={6} className="py-2.5 px-6">
                            <div className="flex items-center justify-between text-xs text-rose-300">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                                <span>{sub.rejectionReason ? `سبب الرفض: ${sub.rejectionReason}` : 'تم رفض المقطع'}</span>
                              </div>
                              <button
                                onClick={() => openAppealModal({ type: 'video', item: sub })}
                                className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>اعتراض على القرار</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* If Appealing: Show status info with admin simulation buttons */}
                      {sub.status === 'appealing' && (
                        <tr className="bg-amber-500/[0.03]">
                          <td colSpan={6} className="py-2.5 px-6 text-xs text-amber-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>الاعتراض قيد التدقيق الإداري — الرد خلال 3 أيام عمل. (سبب الاعتراض: {sub.appealReason || 'العمل يطابق شروط البريف بالكامل'})</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-white/40">تجربة القرار الإداري:</span>
                                <button
                                  onClick={() => resolveAppeal('video', sub.id, 'approved')}
                                  className="px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-all cursor-pointer"
                                  title="قبول الاعتراض وإضافة الأرباح"
                                >
                                  تم قبول الاعتراض ✓
                                </button>
                                <button
                                  onClick={() => resolveAppeal('video', sub.id, 'rejected')}
                                  className="px-2 py-0.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-all cursor-pointer"
                                  title="رفض الاعتراض نهائياً"
                                >
                                  تم رفض الاعتراض ✕
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* =========================================================================
            TAB 2: DESIGNS TABLE (No views, No bot score)
            Columns: التصميم (thumbnail) والحملة، البراند والتاريخ، المبلغ (150 ﷼)،
            جولات التعديل الباقية، الحالة والإجراء.
            ========================================================================= */
        <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-white/50 text-[11px] font-semibold">
                  <th className="py-3.5 px-4">التصميم والحملة، البراند</th>
                  <th className="py-3.5 px-4">المقاس / الرابط المرفوع</th>
                  <th className="py-3.5 px-4 text-center">المبلغ</th>
                  <th className="py-3.5 px-4 text-center">جولات التعديل المتبقية</th>
                  <th className="py-3.5 px-4 text-center">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredDesignSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-white/40 text-xs">
                      لا توجد تصاميم مطابقة للفلاتر المحددة.
                    </td>
                  </tr>
                ) : (
                  filteredDesignSubmissions.map((des) => (
                    <React.Fragment key={des.id}>
                      <tr className="hover:bg-white/[0.03] transition-colors">
                        {/* 1. Design Thumbnail & Campaign & Brand */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 group">
                              <img
                                src={des.previewImages?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=80'}
                                alt={des.campaignTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-bold text-white uppercase bg-black/60 px-1 py-0.5 rounded">
                                  معاينة
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0 max-w-xs">
                              <span className="font-bold text-white truncate">{des.campaignTitle}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {des.brandAvatar && (
                                  <img
                                    src={des.brandAvatar}
                                    alt={des.brandName}
                                    className="w-4 h-4 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                                  />
                                )}
                                <span className="text-[11px] text-muted truncate">{des.brandName} · {des.submittedAt}</span>
                              </div>
                              {des.note && (
                                <span className="text-[10px] text-white/40 mt-0.5 truncate">{des.note}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Size / Uploaded Link (Figma / Canva / File) */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-white/80 font-mono text-[11px] bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/[0.08] w-fit">
                              {des.note?.includes('1920') ? 'ستوري 1080×1920' : 'بوست 1080×1350'}
                            </span>
                            {des.figmaUrl ? (
                              <a
                                href={des.figmaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 font-mono hover:underline"
                              >
                                <span>رابط Figma</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : des.canvaUrl ? (
                              <a
                                href={des.canvaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 font-mono hover:underline"
                              >
                                <span>رابط Canva</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-white/40 flex items-center gap-1 font-mono">
                                <FileText className="w-2.5 h-2.5" />
                                <span>ملف PSD / PDF</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Amount (150 ﷼) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-baseline justify-center gap-1 font-mono font-bold text-white tabular-nums text-sm">
                            <span>{des.earnedAmount || 150}</span>
                            <RiyalSymbol className="w-3.5 h-3.5 text-white inline-block" />
                          </div>
                        </td>

                        {/* 4. Revision Rounds Left */}
                        <td className="py-3.5 px-4 text-center font-mono text-white/80">
                          {des.status === 'approved' ? (
                            <span className="text-white/40 text-[11px]">—</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] text-[11px]">
                              <span>{des.revisionsLeft} متبقية</span>
                            </span>
                          )}
                        </td>

                        {/* 5. Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {getDesignStatusBadge(des)}
                        </td>

                        {/* 6. Action */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            {/* If Needs Revision: Action Button "ارفع النسخة المعدّلة" */}
                            {des.status === 'needs_revision' && (
                              <button
                                onClick={() => handleOpenRevisionModal(des)}
                                className="px-3 py-1 rounded-full bg-white text-black font-bold text-[11px] shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <PenTool className="w-3 h-3" />
                                <span>ارفع النسخة المعدّلة</span>
                              </button>
                            )}


                            {/* If Appealing: Chip "قيد المراجعة الإدارية" */}
                            {des.status === 'appealing' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/15 text-white/50 text-[10px] font-medium cursor-not-allowed">
                                قيد المراجعة الإدارية
                              </span>
                            )}

                            {/* If Approved: Badge "تمت إضافة 150 ﷼ لمحفظتك" */}
                            {(des.status === 'approved' || des.status === 'appeal_approved') && (
                              <StatusBadge tone="success">تمت إضافة {des.earnedAmount || 150} <RiyalSymbol /> لمحفظتك</StatusBadge>
                            )}

                            {des.status === 'pending' && (
                              <span className="text-white/40 text-[11px]">بانتظار تقييم البراند</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Brand comment banner for Needs Revision rows */}
                      {des.status === 'needs_revision' && des.brandComment && (
                        <tr className="bg-amber-500/[0.05]">
                          <td colSpan={6} className="py-2.5 px-6">
                            <div className="flex items-center justify-between text-xs text-amber-200">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="font-semibold">ملاحظة البراند:</span>
                                <span className="text-white/90">{des.brandComment}</span>
                              </div>
                              <button
                                onClick={() => handleOpenRevisionModal(des)}
                                className="text-xs text-white underline hover:text-white/80 cursor-pointer shrink-0"
                              >
                                فتح نافذة الرفع
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Rejection reason banner for Rejected rows */}
                      {des.status === 'rejected' && (
                        <tr className="bg-rose-500/[0.04]">
                          <td colSpan={6} className="py-2.5 px-6">
                            <div className="flex items-center justify-between text-xs text-rose-300">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{des.rejectionReason ? `سبب الرفض: ${des.rejectionReason}` : 'تم رفض المقطع'}</span><span>{des.rejectionReason ? `سبب الرفض: ${des.rejectionReason}` : 'تم رفض المقطع'}</span>
                              </div>
                              <button
                                onClick={() => openAppealModal({ type: 'design', item: des })}
                                className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>اعتراض على القرار</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Appealing info row with testing buttons */}
                      {des.status === 'appealing' && (
                        <tr className="bg-amber-500/[0.03]">
                          <td colSpan={6} className="py-2.5 px-6 text-xs text-amber-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>الاعتراض على قرار رفض التصميم قيد المراجعة الإدارية من مشرف المنصة (الرد خلال 3 أيام عمل).</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-white/40">تجربة القرار الإداري:</span>
                                <button
                                  onClick={() => resolveAppeal('design', des.id, 'approved')}
                                  className="px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-all cursor-pointer"
                                  title="قبول الاعتراض وإضافة 150 <RiyalSymbol />"
                                >
                                  تم قبول الاعتراض ✓
                                </button>
                                <button
                                  onClick={() => resolveAppeal('design', des.id, 'rejected')}
                                  className="px-2 py-0.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-all cursor-pointer"
                                  title="رفض الاعتراض نهائياً"
                                >
                                  تم رفض الاعتراض ✕
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Campaign Picker Modal for "+ إرسال عمل جديد" */}
      {isCampaignPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-lg rounded-[28px] bg-surface border border-white/20 p-6 flex flex-col gap-5 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>اختر الحملة لإرسال عملك</span>
              </h3>
              <button
                onClick={() => setIsCampaignPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              اختر الحملة التي تريد إرسال عملك إليها (حملات الفيديو تفتح نموذج تدقيق المقاطع، وحملات التصميم تفتح نموذج رفع التصاميم):
            </p>

            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {campaigns.map((camp) => {
                const isCampDesign = camp.campaignType === 'design';
                return (
                  <div
                    key={camp.id}
                    onClick={() => handleSelectCampaignToSubmit(camp)}
                    className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/30 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={camp.coverImage}
                        alt={camp.title}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-white transition-colors">
                          {camp.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-white/50">{camp.brandName}</span>
                          <span className="text-white/20">·</span>
                          {isCampDesign ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold flex items-center gap-1">
                              <PenTool className="w-2.5 h-2.5" />
                              <span>حملة تصميم (150 <RiyalSymbol />)</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1">
                              <Eye className="w-2.5 h-2.5" />
                              <span>حملة فيديو ({camp.ratePer1k} <RiyalSymbol /> / 1K)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      اختيار
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsView;
