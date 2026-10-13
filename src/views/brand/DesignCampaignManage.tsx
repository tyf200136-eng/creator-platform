import React, { useState } from 'react';
import FieldError from '../../components/common/FieldError';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import RiyalSymbol from '../../components/RiyalSymbol';
import { DesignSubmission, DesignComment } from '../../types';
import {
  ArrowRight,
  Check,
  X as XIcon,
  Clock,
  ExternalLink,
  Eye,
  Users,
  Settings,
  LayoutGrid,
  List,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Smartphone,
  Download,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pin,
  FolderArchive,
  Layers,
  Palette,
  FileCheck,
  Bookmark,
  Heart,
  MessageCircle,
  Send
} from 'lucide-react';

// شارة حالة التصميم: مكان واحد يحدد اللون والنص لكل حالة
const DesignStatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  if (status === 'approved') return <StatusBadge tone="success" className={className}>معتمد</StatusBadge>;
  if (status === 'pending') return <StatusBadge tone="warning" pulse className={className}>بانتظار المراجعة</StatusBadge>;
  if (status === 'needs_revision') return <StatusBadge tone="warning" className={className}>بانتظار التعديل</StatusBadge>;
  return <StatusBadge tone="danger" className={className}>مرفوض</StatusBadge>;
}; 

export const DesignCampaignManage: React.FC = () => {
  const { 
    selectedCampaign, 
    setBrandView, 
    designSubmissions, 
    applications,
    approveDesignSubmission,
    requestDesignRevision,
    rejectDesignSubmission,
    approveApplication,
    rejectApplication,
    showToast 
  } = useApp();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'designs' | 'applications' | 'designers' | 'settings'>('designs');
  
  // Status Filter for Designs: الكل / بانتظار المراجعة / بانتظار التعديل / المعتمدة / المرفوضة
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'needs_revision' | 'approved' | 'rejected'>('all');
  
  // View mode: Grid vs List (default is grid)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Currently opened review submission
  const [selectedDesign, setSelectedDesign] = useState<DesignSubmission | null>(null);

  // Review Viewer Settings
  const [viewerMockup, setViewerMockup] = useState<'none' | 'post' | 'story'>('post');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Rejection Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('لا يطابق المواصفات');
  const [rejectNote, setRejectNote] = useState<string>('');
  const [showRejectError, setShowRejectError] = useState(false);

  // Revision Request Drawer / Mode
  const [isRevisionMode, setIsRevisionMode] = useState<boolean>(false);
  const [revisionNote, setRevisionNote] = useState<string>('');
  const [pinnedComments, setPinnedComments] = useState<DesignComment[]>([]);
  const [pinDropActive, setPinDropActive] = useState<boolean>(false);

  if (!selectedCampaign) return null;

  const designDetails = selectedCampaign.designDetails;
  const pricePerDesign = designDetails?.pricePerDesign || 150;
  const maxRounds = designDetails?.revisionRoundsAllowed ?? 2;
  const totalDesignsNeeded = designDetails?.totalDesignsNeeded || 10;
  
  // Submissions for this campaign
  const campaignDesigns = designSubmissions.filter(d => d.campaignId === selectedCampaign.id);
  
  // Count approved designs
  const approvedCount = campaignDesigns.filter(d => d.status === 'approved').length;
  const remainingSlots = Math.max(0, totalDesignsNeeded - approvedCount);

  // Filtered designs
  const filteredDesigns = campaignDesigns.filter(d => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return d.status === 'pending';
    if (statusFilter === 'needs_revision') return d.status === 'needs_revision';
    if (statusFilter === 'approved') return d.status === 'approved';
    if (statusFilter === 'rejected') return d.status === 'rejected';
    return true;
  });

  // Unique participating designers
  const uniqueDesignersMap = new Map<string, {
    id: string;
    name: string;
    avatar: string;
    handle: string;
    submittedCount: number;
    approvedCount: number;
    totalEarned: number;
  }>();

  campaignDesigns.forEach(d => {
    const existing = uniqueDesignersMap.get(d.designerId) || {
      id: d.designerId,
      name: d.designerName,
      avatar: d.designerAvatar,
      handle: d.designerHandle,
      submittedCount: 0,
      approvedCount: 0,
      totalEarned: 0,
    };
    existing.submittedCount += 1;
    if (d.status === 'approved') {
      existing.approvedCount += 1;
      existing.totalEarned += d.earnedAmount || pricePerDesign;
    }
    uniqueDesignersMap.set(d.designerId, existing);
  });

  const participatingDesigners = Array.from(uniqueDesignersMap.values());

  const handleOpenReview = (design: DesignSubmission) => {
    setSelectedDesign(design);
    setZoomLevel(100);
    setActiveSlideIndex(0);
    setIsRevisionMode(false);
    setPinnedComments(design.comments || []);
    setPinDropActive(false);
  };

  const handleApproveDesign = (id: string) => {
    approveDesignSubmission(id);
    if (selectedDesign && selectedDesign.id === id) {
      setSelectedDesign(prev => prev ? { ...prev, status: 'approved' } : null);
    }
  };

  // لو اختار "أخرى" لازم يوضّح السبب في الملاحظة
  const rejectNoteError =
    rejectReason.startsWith('أخرى') && rejectNote.trim().length < 10
      ? 'بما إنك اخترت "أخرى"، وضّح السبب للمصمم (10 أحرف على الأقل)'
      : undefined;

  const handleConfirmReject = () => {
    if (!selectedDesign) return;
    if (rejectNoteError) {
      setShowRejectError(true);
      return;
    }
    setShowRejectError(false);
    const finalReason = rejectNote.trim() ? `${rejectReason} - ${rejectNote.trim()}` : rejectReason;
    rejectDesignSubmission(selectedDesign.id, finalReason);
    setSelectedDesign(prev => prev ? { ...prev, status: 'rejected', rejectionReason: finalReason } : null);
    setIsRejectModalOpen(false);
    setRejectNote('');
  };

  const handleSendRevision = () => {
    if (!selectedDesign) return;
    if (!revisionNote.trim() && pinnedComments.length === 0) {
      showToast('يرجى كتابة ملاحظات التعديل أو تحديد مواضع التعديل على التصميم.');
      return;
    }
    requestDesignRevision(selectedDesign.id, revisionNote, pinnedComments);
    setSelectedDesign(prev => prev ? {
      ...prev,
      status: 'needs_revision',
      brandComment: revisionNote,
      comments: pinnedComments,
      revisionsLeft: Math.max(0, (prev.revisionsLeft ?? 2) - 1),
    } : null);
    setIsRevisionMode(false);
    setRevisionNote('');
    setPinDropActive(false);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinDropActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const pinNumber = pinnedComments.length + 1;
    const pinText = prompt(`ملاحظة النقطة رقم #${pinNumber}:`, 'يرجى تعديل هذا الجزء');
    if (pinText && pinText.trim()) {
      const newPin: DesignComment = {
        id: `pin-${Date.now()}`,
        author: selectedCampaign.brandName,
        text: pinText.trim(),
        createdAt: 'الآن',
        x,
        y,
      };
      setPinnedComments(prev => [...prev, newPin]);
      showToast(`تمت إضافة النقطة #${pinNumber} على التصميم`);
    }
  };

  const removePin = (pinId: string) => {
    setPinnedComments(prev => prev.filter(p => p.id !== pinId));
  };

  return (
    <div className="relative pb-36 px-4 sm:px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none font-sans">
      {/* Top Breadcrumb & Campaign Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/[0.08] pb-6">
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            onClick={() => setBrandView('campaigns')}
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 mt-1 sm:mt-0"
            title="الرجوع لقائمة الحملات"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white font-heading">{selectedCampaign.title}</h1>
              <StatusBadge tone="success">حملة تصميم نشطة</StatusBadge>
            </div>
            {/* Header financial line */}
            <div className="text-xs sm:text-sm text-[#A3A3A3] font-medium flex flex-wrap items-center gap-2">
              <span>الميزانية {selectedCampaign.totalBudget.toLocaleString()} <RiyalSymbol /></span>
              <span className="text-white/20">·</span>
              <span>المصروف {selectedCampaign.spentBudget.toLocaleString()} <RiyalSymbol /></span>
              <span className="text-white/20">·</span>
              <span className="text-white font-semibold">{pricePerDesign} <RiyalSymbol /> لكل تصميم</span>
            </div>
          </div>
        </div>

        {/* Right side: Segmented Progress & Deadline Chips */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shrink-0">
          {/* Segmented Progress: التصاميم المعتمدة: 3 من 10 */}
          <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex flex-col gap-1.5 min-w-[220px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">التصاميم المعتمدة:</span>
              <span className="font-bold text-white font-mono">
                {approvedCount} من {totalDesignsNeeded}
              </span>
            </div>
            {/* Segmented Bar */}
            <div className="flex items-center gap-1 w-full">
              {Array.from({ length: totalDesignsNeeded }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    idx < approvedCount
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                      : 'bg-white/10'
                  }`}
                  title={`المقعد ${idx + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/50">
              <span>{remainingSlots > 0 ? `${remainingSlots} مقاعد متبقية` : 'اكتملت جميع المقاعد'}</span>
              <span>معدل الإنجاز {Math.round((approvedCount / totalDesignsNeeded) * 100)}%</span>
            </div>
          </div>

          {/* Deadline Chips */}
          <div className="flex flex-wrap sm:flex-col gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs text-white/90">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>آخر موعد للتسليم: 25 أكتوبر</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مهلة المراجعة: 7 أيام</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row (Design campaigns only): التصاميم المستلمة / طلبات الانضمام (if applies) / المصممون المشاركون / إعدادات الحملة */}
      <div className="flex items-center gap-2 p-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit overflow-x-auto">
        {[
          { id: 'designs', label: 'التصاميم المستلمة', count: campaignDesigns.length },
          ...(selectedCampaign.requiresApplication ? [{ id: 'applications', label: 'طلبات الانضمام', count: applications.length }] : []),
          { id: 'designers', label: 'المصممون المشاركون', count: participatingDesigners.length },
          { id: 'settings', label: 'إعدادات الحملة', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === tab.id ? 'bg-neutral-200 text-black' : 'bg-white/10 text-white'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: التصاميم المستلمة (Gallery Grid & Review Panel) */}
      {activeTab === 'designs' && (
        <div className="flex flex-col gap-6">
          {/* Sub-Filters & View Mode Toggle Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            {/* Status Filter Chips: الكل / بانتظار المراجعة / بانتظار التعديل / المعتمدة / المرفوضة */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'الكل', count: campaignDesigns.length },
                { id: 'pending', label: 'بانتظار المراجعة', count: campaignDesigns.filter(d => d.status === 'pending').length },
                { id: 'needs_revision', label: 'بانتظار التعديل', count: campaignDesigns.filter(d => d.status === 'needs_revision').length },
                { id: 'approved', label: 'المعتمدة', count: campaignDesigns.filter(d => d.status === 'approved').length },
                { id: 'rejected', label: 'المرفوضة', count: campaignDesigns.filter(d => d.status === 'rejected').length },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setStatusFilter(chip.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    statusFilter === chip.id
                      ? 'bg-white/20 text-white border border-white/40 shadow-sm font-semibold'
                      : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span className="text-[10px] opacity-70 font-mono">({chip.count})</span>
                </button>
              ))}
            </div>

            {/* Toggle Grid vs List */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.06] border border-white/[0.1] self-end sm:self-auto shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="عرض شبكي (معرض التصاميم)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="عرض قائمة تفصيلي"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* GALLERY GRID VIEW (Default) */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredDesigns.map((design) => {
                const isApproved = design.status === 'approved';
                const isPending = design.status === 'pending';
                const isNeedsRevision = design.status === 'needs_revision';
                const isRejected = design.status === 'rejected';

                const displayImage = design.previewImages?.[0] || selectedCampaign.coverImage;

                return (
                  <div
                    key={design.id}
                    onClick={() => handleOpenReview(design)}
                    className="group relative rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.07] overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                  >
                    {/* Thumbnail Container with Watermark */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900">
                      <img
                        src={displayImage}
                        alt={design.campaignTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* WATERMARK OVERLAY (Only if NOT approved) */}
                      {!isApproved && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/25">
                          {/* Centered Watermark Stamp */}
                          <div className="transform -rotate-12 px-6 py-2 rounded-xl bg-black/60 border border-white/20 backdrop-blur-md shadow-2xl">
                            <span className="text-sm font-bold tracking-widest text-white/70 select-none">
                              معاينة فقط · لم يُعتمد
                            </span>
                          </div>

                          {/* Diagonal watermark pattern */}
                          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                        </div>
                      )}

                      {/* Top Badges overlay: Status + Round */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                        {/* Status pill */}
                        <DesignStatusBadge status={design.status} className="bg-black/60!" />

                        {/* Revision Round badge: الجولة X من 2 */}
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-mono font-medium">
                          الجولة {Math.min(maxRounds, maxRounds - (design.revisionsLeft ?? maxRounds) + 1)} من {maxRounds}
                        </span>
                      </div>

                      {/* Hover action preview hint */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                          <Eye className="w-3.5 h-3.5" />
                          <span>فتح لوحة التدقيق والمراجعة</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Footer: Designer Info & Details */}
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={design.designerAvatar}
                            alt={design.designerName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{design.designerName}</p>
                            <p className="text-[10px] text-[#A3A3A3] font-mono truncate">{design.designerHandle}</p>
                          </div>
                        </div>

                        {/* Time */}
                        <span className="text-[10px] text-white/50 shrink-0 font-medium">
                          {design.submittedAt}
                        </span>
                      </div>

                      {/* Formats included */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {design.figmaUrl && (
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono">
                            Figma
                          </span>
                        )}
                        {design.canvaUrl && (
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono">
                            Canva
                          </span>
                        )}
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-white/70 font-mono">
                          PNG 1080×1350
                        </span>
                        {design.downloadableFiles && design.downloadableFiles.length > 0 && (
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-white/70 font-mono">
                            PSD
                          </span>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                        <span className="text-white/50">المستحق عند الاعتماد:</span>
                        <div className="flex items-baseline gap-1 font-bold text-white font-mono">
                          <span>{pricePerDesign}</span>
                          <RiyalSymbol className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredDesigns.length === 0 && (
                <div className="col-span-full py-16 text-center text-[#A3A3A3] flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold">لا توجد تصاميم مطابقة لهذا التصنيف</p>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="text-xs text-white/80 hover:text-white underline mt-1 cursor-pointer"
                  >
                    عرض كل التصاميم
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LIST VIEW (Table style) */}
          {viewMode === 'list' && (
            <div className="rounded-[24px] bg-white/[0.04] border border-white/[0.1] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-white/[0.03] border-b border-white/[0.08] text-white/60 font-semibold">
                    <tr>
                      <th className="p-4">التصميم</th>
                      <th className="p-4">المصمم</th>
                      <th className="p-4">تاريخ الرفع</th>
                      <th className="p-4">الجولة</th>
                      <th className="p-4">الصيغ المتوفرة</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">المستحق</th>
                      <th className="p-4 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredDesigns.map((design) => {
                      const isApproved = design.status === 'approved';
                      return (
                        <tr
                          key={design.id}
                          onClick={() => handleOpenReview(design)}
                          className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <td className="p-4">
                            <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-white/10">
                              <img
                                src={design.previewImages?.[0] || selectedCampaign.coverImage}
                                alt="thumb"
                                className="w-full h-full object-cover"
                              />
                              {!isApproved && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <span className="text-[7px] text-white/80 font-bold -rotate-12">معاينة</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={design.designerAvatar}
                                alt={design.designerName}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20"
                              />
                              <div>
                                <p className="font-bold text-white">{design.designerName}</p>
                                <p className="text-[10px] text-white/50 font-mono">{design.designerHandle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-white/70 font-mono">{design.submittedAt}</td>
                          <td className="p-4 font-mono text-white/80">الجولة {Math.min(maxRounds, maxRounds - (design.revisionsLeft ?? maxRounds) + 1)} من {maxRounds}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {design.figmaUrl && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono">Figma</span>}
                              {design.canvaUrl && <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">Canva</span>}
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-white/70 font-mono">PNG</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <DesignStatusBadge status={design.status} />
                          </td>
                          <td className="p-4 font-mono font-bold text-white">
                            {pricePerDesign} <RiyalSymbol />
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReview(design);
                              }}
                              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black font-semibold text-xs transition-all cursor-pointer"
                            >
                              مراجعة
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: طلبات الانضمام (If campaign requires application) */}
      {activeTab === 'applications' && selectedCampaign.requiresApplication && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <div key={app.id} className="p-5 rounded-[24px] bg-white/[0.04] border border-white/[0.12] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img src={app.creatorAvatar} alt={app.creatorName} className="w-12 h-12 rounded-full object-cover ring-1 ring-white/20" />
                <div>
                  <h3 className="text-sm font-bold text-white">{app.creatorName}</h3>
                  <span className="text-xs text-[#A3A3A3] font-mono">{app.creatorHandle}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-white/80 leading-relaxed">
                <span className="block font-bold text-white mb-1">رسالة التقديم ومعرض الأعمال:</span>
                {app.motivation}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => approveApplication(app.id)}
                  className="flex-1 py-2 rounded-full bg-white text-black font-bold text-xs shadow-sm cursor-pointer hover:bg-neutral-100 transition-all"
                >
                  قبول المصمم للمشاركة
                </button>
                <button
                  onClick={() => rejectApplication(app.id)}
                  className="flex-1 py-2 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20 cursor-pointer hover:bg-rose-500/20 transition-all"
                >
                  رفض الطلب
                </button>
              </div>
            </div>
          ))}
          {applications.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#A3A3A3]">
              لا توجد طلبات انضمام جديدة حالياً.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: المصممون المشاركون */}
      {activeTab === 'designers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {participatingDesigners.map((designer) => (
            <div
              key={designer.id}
              className="p-5 rounded-[24px] bg-white/[0.04] border border-white/[0.12] flex flex-col justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={designer.avatar}
                  alt={designer.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{designer.name}</h3>
                  <p className="text-xs text-white/50 font-mono truncate">{designer.handle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs">
                <div>
                  <span className="text-white/50 block text-[11px]">التصاميم المعتمدة</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">{designer.approvedCount}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[11px]">إجمالي المستحقات</span>
                  <span className="text-white font-bold font-mono text-sm">{designer.totalEarned.toLocaleString()} <RiyalSymbol /></span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/70 pt-2 border-t border-white/[0.06]">
                <span>الأعمال المرفوعة: {designer.submittedCount}</span>
                <span className="text-emerald-400 text-[11px] font-semibold">مصمم معتمد ✓</span>
              </div>
            </div>
          ))}
          {participatingDesigners.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#A3A3A3]">
              لم يشارك أي مصمم في هذه الحملة بعد.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: إعدادات الحملة */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Specs card */}
            <div className="p-6 rounded-[28px] bg-white/[0.04] border border-white/[0.12] flex flex-col gap-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <span>المواصفات الفنية المطلوبة للحملة</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-white/50 block mb-1">المقاسات المعتمدة:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {designDetails?.sizes?.map((sz, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-white/[0.08] text-white font-mono">{sz}</span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-white/50 block mb-1">صيغ التسليم الإلزامية:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {designDetails?.formats?.map((fmt, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-white/[0.08] text-white">{fmt}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              {designDetails?.brandColors && designDetails.brandColors.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
                  <span className="text-white/50 text-xs">باليت ألوان العلامة التجارية:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {designDetails.brandColors.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                        <span className="w-5 h-5 rounded-full border border-white/30 shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-xs font-mono text-white/80">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exact Copy */}
              {designDetails?.exactCopy && (
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-1 text-xs">
                  <span className="text-white/50">النص الإعلاني الإلزامي بالتصميم:</span>
                  <p className="text-white font-bold leading-relaxed">{designDetails.exactCopy}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-6 rounded-[28px] bg-white/[0.04] border border-white/[0.12] flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white">إدارة الحملة</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                يمكنك إيقاف استقبال تصاميم جديدة مؤقتاً أو تمديد مهلة الحملة.
              </p>
              <button
                onClick={() => showToast('الحملة نشطة وتستقبل التصاميم بشكل طبيعي.')}
                className="w-full py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                تعديل إعدادات الميزانية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN DESIGN REVIEW PANEL MODAL */}
      {selectedDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto">
          <div className="relative w-full max-w-6xl max-h-[92vh] rounded-[32px] bg-[#0E0E0E] border border-white/[0.18] shadow-[0_24px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-right">
            
            {/* Top Modal Header */}
            <div className="p-5 border-b border-white/[0.1] flex items-center justify-between gap-4 bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedDesign(null)}
                  className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
                  title="إغلاق"
                >
                  <XIcon className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>مراجعة وتدقيق التصميم</span>
                    <span className="text-white/40 font-normal">|</span>
                    <span className="text-white/80 font-normal text-xs">{selectedDesign.designerName}</span>
                  </h2>
                  <span className="text-[11px] text-[#A3A3A3]">تاريخ الرفع: {selectedDesign.submittedAt}</span>
                </div>
              </div>

              {/* Status pill & round in header */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-white/50 font-mono hidden sm:inline">
                 الجولة {Math.min(maxRounds, maxRounds - (selectedDesign.revisionsLeft ?? maxRounds) + 1)} من {maxRounds}
                </span>

               <DesignStatusBadge status={selectedDesign.status} />
              </div>
            </div>

            {/* Modal Body: Two Columns (Large Viewer on Left/Center 7 cols, Inspector on Right 5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
              
              {/* LEFT/CENTER: Large Viewer (7 cols) */}
              <div className="lg:col-span-7 p-4 sm:p-6 bg-black/60 flex flex-col gap-4 border-b lg:border-b-0 lg:border-l border-white/[0.08] justify-between">
                
                {/* Viewer Toolbar: Zoom controls + Mockup Toggle + Pin Comment Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                  {/* Zoom controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                      className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white transition-all cursor-pointer"
                      title="تكبير"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-mono text-white/80 px-1">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                      className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white transition-all cursor-pointer"
                      title="تصغير"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(100)}
                      className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white transition-all cursor-pointer"
                      title="إعادة ضبط"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mockup toggle: حر / منشور إنستغرام / ستوري */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.08]">
                    <button
                      onClick={() => setViewerMockup('post')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        viewerMockup === 'post' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      منشور Instagram
                    </button>
                    <button
                      onClick={() => setViewerMockup('story')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        viewerMockup === 'story' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      قصة (Story)
                    </button>
                    <button
                      onClick={() => setViewerMockup('none')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        viewerMockup === 'none' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      عرض أصلي
                    </button>
                  </div>

                  {/* Pin comment toggle button */}
                  {selectedDesign.status !== 'approved' && (
                    <button
                      onClick={() => {
                        setPinDropActive(!pinDropActive);
                        if (!isRevisionMode) setIsRevisionMode(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        pinDropActive
                          ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                          : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12]'
                      }`}
                    >
                      <Pin className="w-3 h-3" />
                      <span>{pinDropActive ? 'انقر على التصميم لوضع ملاحظة' : 'إضافة ملاحظة نقطية'}</span>
                    </button>
                  )}
                </div>

                {/* Canvas Area */}
                <div className="relative flex-1 min-h-[420px] max-h-[560px] overflow-auto flex items-center justify-center p-3 rounded-2xl bg-neutral-950/80 border border-white/[0.06]">
                  
                  {/* Outer container with scale */}
                  <div
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                    className="transition-transform duration-200"
                  >
                    {/* Mockup Frame: Post vs Story vs Raw */}
                    {viewerMockup === 'post' && (
                      <div className="w-[320px] sm:w-[360px] rounded-[24px] bg-[#121212] border border-white/20 shadow-2xl overflow-hidden flex flex-col">
                        {/* Mockup IG Header */}
                        <div className="p-3 border-b border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={selectedCampaign.brandAvatar} alt="brand" className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20" />
                            <span className="text-[11px] font-bold text-white">{selectedCampaign.brandName}</span>
                          </div>
                          <span className="text-white/40 text-xs">•••</span>
                        </div>

                        {/* Image inside mockup */}
                        <div
                          onClick={handleImageClick}
                          className="relative aspect-[4/5] w-full bg-neutral-900 cursor-crosshair overflow-hidden"
                        >
                          <img
                            src={selectedDesign.previewImages[activeSlideIndex] || selectedDesign.previewImages[0]}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />

                          {/* Watermark overlay (unless approved) */}
                          {selectedDesign.status !== 'approved' && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/20">
                              <div className="transform -rotate-12 px-6 py-2 rounded-xl bg-black/75 border border-white/20 backdrop-blur-md shadow-2xl">
                                <span className="text-sm font-bold tracking-widest text-white/80 select-none">
                                  معاينة فقط · لم يُعتمد
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Pinned Comments rendering */}
                          {pinnedComments.map((pin, pIdx) => (
                            <div
                              key={pin.id || pIdx}
                              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                              onClick={(e) => {
                                e.stopPropagation();
                                showToast(`الملاحظة #${pIdx + 1}: ${pin.text}`);
                              }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400 text-black font-bold text-[10px] flex items-center justify-center shadow-lg border-2 border-black cursor-pointer hover:scale-125 transition-transform z-20"
                              title={pin.text}
                            >
                              {pIdx + 1}
                            </div>
                          ))}
                        </div>

                        {/* Mockup IG Footer */}
                        <div className="p-3 flex flex-col gap-1.5 text-right">
                          <div className="flex items-center justify-between text-white/80">
                            <div className="flex items-center gap-3 text-xs">
                              <Heart className="w-4 h-4" />
                              <MessageCircle className="w-4 h-4" />
                              <Send className="w-4 h-4" />
                            </div>
                            <Bookmark className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] text-white/70 line-clamp-1 mt-1">
                            <span className="font-bold text-white ml-1">{selectedCampaign.brandName}</span>
                            {selectedCampaign.designDetails?.exactCopy || selectedDesign.note}
                          </p>
                        </div>
                      </div>
                    )}

                    {viewerMockup === 'story' && (
                      <div className="w-[260px] sm:w-[280px] rounded-[32px] bg-black border-2 border-white/20 shadow-2xl overflow-hidden flex flex-col aspect-[9/16] relative">
                        {/* Story Top Bar */}
                        <div className="absolute top-2.5 inset-x-3 z-20 flex flex-col gap-2">
                          <div className="h-0.5 w-full bg-white/40 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-2/3" />
                          </div>
                          <div className="flex items-center gap-2">
                            <img src={selectedCampaign.brandAvatar} alt="brand" className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-[10px] font-bold text-white">{selectedCampaign.brandName}</span>
                            <span className="text-[9px] text-white/60">منذ 1 س</span>
                          </div>
                        </div>

                        {/* Image */}
                        <div
                          onClick={handleImageClick}
                          className="relative w-full h-full cursor-crosshair overflow-hidden"
                        >
                          <img
                            src={selectedDesign.previewImages[activeSlideIndex] || selectedDesign.previewImages[0]}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />

                          {/* Watermark overlay */}
                          {selectedDesign.status !== 'approved' && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/20">
                              <div className="transform -rotate-12 px-5 py-2 rounded-xl bg-black/75 border border-white/20 backdrop-blur-md shadow-2xl">
                                <span className="text-xs font-bold tracking-widest text-white/80 select-none">
                                  معاينة فقط · لم يُعتمد
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Pinned Comments rendering */}
                          {pinnedComments.map((pin, pIdx) => (
                            <div
                              key={pin.id || pIdx}
                              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                              onClick={(e) => {
                                e.stopPropagation();
                                showToast(`الملاحظة #${pIdx + 1}: ${pin.text}`);
                              }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400 text-black font-bold text-[10px] flex items-center justify-center shadow-lg border-2 border-black cursor-pointer hover:scale-125 transition-transform z-20"
                              title={pin.text}
                            >
                              {pIdx + 1}
                            </div>
                          ))}
                        </div>

                        {/* Story Bottom Reply bar */}
                        <div className="absolute bottom-3 inset-x-3 z-20 flex items-center gap-2">
                          <div className="flex-1 py-1 px-3 rounded-full border border-white/30 text-[10px] text-white/60 bg-black/30 backdrop-blur-md">
                            إرسال رسالة...
                          </div>
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    {viewerMockup === 'none' && (
                      <div
                        onClick={handleImageClick}
                        className="relative max-w-[480px] rounded-2xl overflow-hidden shadow-2xl cursor-crosshair border border-white/20"
                      >
                        <img
                          src={selectedDesign.previewImages[activeSlideIndex] || selectedDesign.previewImages[0]}
                          alt="preview"
                          className="w-full max-h-[500px] object-contain"
                        />

                        {/* Watermark overlay */}
                        {selectedDesign.status !== 'approved' && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/25">
                            <div className="transform -rotate-12 px-8 py-3 rounded-2xl bg-black/80 border border-white/25 backdrop-blur-md shadow-2xl">
                              <span className="text-base font-bold tracking-widest text-white/90 select-none">
                                معاينة فقط · لم يُعتمد
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Pinned Comments rendering */}
                        {pinnedComments.map((pin, pIdx) => (
                          <div
                            key={pin.id || pIdx}
                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`الملاحظة #${pIdx + 1}: ${pin.text}`);
                            }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400 text-black font-bold text-[10px] flex items-center justify-center shadow-lg border-2 border-black cursor-pointer hover:scale-125 transition-transform z-20"
                            title={pin.text}
                          >
                            {pIdx + 1}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Slides carousel navigation if multiple slides */}
                {selectedDesign.previewImages.length > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                      disabled={activeSlideIndex === 0}
                      className="p-1.5 rounded-full bg-white/10 disabled:opacity-30 hover:bg-white/20 text-white transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {selectedDesign.previewImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSlideIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                            activeSlideIndex === idx ? 'bg-white w-6' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveSlideIndex(prev => Math.min(selectedDesign.previewImages.length - 1, prev + 1))}
                      disabled={activeSlideIndex === selectedDesign.previewImages.length - 1}
                      className="p-1.5 rounded-full bg-white/10 disabled:opacity-30 hover:bg-white/20 text-white transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT: Review Inspector & Actions Panel (5 cols) */}
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between gap-6 overflow-y-auto bg-white/[0.01]">
                
                <div className="flex flex-col gap-5">
                  {/* Automatic Specs Verification Box: فحص المواصفات */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>فحص المواصفات الفنية التلقائي</span>
                    </span>

                    <div className="flex flex-col gap-2 text-xs pt-1">
                      <div className="flex items-center justify-between text-emerald-400">
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          <span>المقاس مطابق (1080×1350)</span>
                        </span>
                        <span className="font-mono text-[11px] font-bold">100%</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-400">
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          <span>الدقة عالية وخالية من التردي</span>
                        </span>
                        <span className="font-mono text-[11px] font-bold">4K</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-400">
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          <span>الصيغ المطلوبة مكتملة (PNG، PSD، Figma)</span>
                        </span>
                        <span className="font-mono text-[11px] font-bold">مكتمل ✓</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-400">
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          <span>الرابط سليم وصلاحية التعديل مفعلة</span>
                        </span>
                        <span className="font-mono text-[11px] font-bold">نشط ✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Designer's Idea Description Note */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-white/80">ملاحظة وفكرة المصمم:</span>
                    <p className="text-xs text-white/90 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                      {selectedDesign.note || 'لم يرفق المصمم شرحاً إضافياً.'}
                    </p>
                  </div>

                  {/* Designer Profile Card */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={selectedDesign.designerAvatar}
                        alt={selectedDesign.designerName}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{selectedDesign.designerName}</h4>
                        <span className="text-[10px] text-white/50 font-mono block">{selectedDesign.designerHandle}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                          12 تصميم معتمد بالمنصة ✓
                        </span>
                      </div>
                    </div>

                    {/* External Portfolio Links */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={selectedDesign.figmaUrl || 'https://behance.net'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white transition-all"
                        title="معرض الأعمال (Behance / Dribbble)"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Pinned Comments Drawer if active */}
                  {isRevisionMode && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>طلب تعديل وملاحظات</span>
                        </span>
                        <span className="text-[10px] font-mono text-amber-200">
                          جولات التعديل المتبقية: {selectedDesign.revisionsLeft}
                        </span>
                      </div>

                      {/* Numbered Pins List */}
                      {pinnedComments.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] text-white/70 font-semibold">النقاط المحددة على التصميم:</span>
                          <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
                            {pinnedComments.map((pin, idx) => (
                              <div key={pin.id || idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/30 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-4 h-4 rounded-full bg-amber-400 text-black font-bold text-[9px] flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="text-white/90 truncate text-[11px]">{pin.text}</span>
                                </div>
                                <button
                                  onClick={() => removePin(pin.id)}
                                  className="text-white/40 hover:text-rose-400 transition-colors p-1"
                                >
                                  <XIcon className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* General revision note */}
                      <textarea
                        rows={3}
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                        placeholder="اكتب التوجيهات العامة للتعديل (مثل: نرجو تفتيح الخلفية وتكبير الشعار 10%)..."
                        className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:border-amber-400 resize-none"
                      />

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleSendRevision}
                          className="flex-1 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all cursor-pointer shadow-sm"
                        >
                          إرسال طلب التعديل للمصمم
                        </button>
                        <button
                          onClick={() => setIsRevisionMode(false)}
                          className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fixed Amount Line: مبلغ التصميم: 150 ﷼ */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-between text-xs">
                    <span className="text-white/60">مبلغ التصميم المعتمد:</span>
                    <div className="flex items-baseline gap-1 font-bold text-white font-mono text-sm">
                      <span>{pricePerDesign}</span>
                      <RiyalSymbol className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTIONS BAR */}
                <div className="flex flex-col gap-2.5 pt-4 border-t border-white/[0.08]">
                  {/* If Already Approved */}
                  {selectedDesign.status === 'approved' ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم اعتماد التصميم وصرف {pricePerDesign} <RiyalSymbol /> للمصمم</span>
                      </div>

                      {/* Download Source Files Button */}
                      <div className="flex items-center gap-2">
                        <a
                          href={selectedDesign.previewImages[0]}
                          download="Design_Full_Resolution.png"
                          className="flex-1 py-3 px-5 rounded-full bg-white text-black font-bold text-xs hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                        >
                          <Download className="w-4 h-4" />
                          <span>تحميل الملفات الأصلية (PNG / PSD)</span>
                        </a>

                        {selectedDesign.figmaUrl && (
                          <a
                            href={selectedDesign.figmaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="py-3 px-4 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-xs transition-all flex items-center gap-1.5"
                          >
                            <span>Figma</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* If Not Approved: Primary White Approve + Secondary Revision + Danger Reject */
                    <div className="flex flex-col gap-2.5">
                      {/* Primary White Button: اعتمد التصميم وادفع 150 ﷼ */}
                      <button
                        onClick={() => handleApproveDesign(selectedDesign.id)}
                        className="w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_24px_rgba(255,255,255,0.45)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-black" />
                        <span>اعتمد التصميم وادفع {pricePerDesign} <RiyalSymbol /></span>
                      </button>

                      <div className="flex items-center gap-2.5">
                        {/* Secondary Button: اطلب تعديلاً */}
                        <button
                          onClick={() => {
                            setIsRevisionMode(true);
                            setPinDropActive(true);
                          }}
                          disabled={selectedDesign.revisionsLeft === 0}
                          className="flex-1 py-3 px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-40 disabled:hover:bg-white/[0.08] border border-white/[0.14] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                          title={selectedDesign.revisionsLeft === 0 ? 'استُنفدت جولات التعديل المسموحة' : undefined}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          <span>اطلب تعديلاً ({selectedDesign.revisionsLeft} متبقية)</span>
                        </button>

                        {/* Danger Button: ارفض التصميم */}
                        <button
                          onClick={() => setIsRejectModalOpen(true)}
                          className="py-3 px-5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XIcon className="w-4 h-4" />
                          <span>ارفض التصميم</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {isRejectModalOpen && selectedDesign && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-[28px] bg-[#121212] border border-white/20 p-6 flex flex-col gap-5 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>تحديد سبب رفض التصميم</span>
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              يرجى اختيار سبب الرفض لتوضيحه للمصمم بشكل واضح ومهني:
            </p>

            {/* Reasons Radio list */}
            <div className="flex flex-col gap-2">
              {[
                'لا يطابق المواصفات المطلوبة',
                'لا يلتزم بهوية العلامة التجارية والألوان',
                'جودة منخفضة أو دقة غير مقبولة',
                'محتوى منسوخ أو غير أصلي',
                'أخرى (توضيح بملاحظة)',
              ].map((reason) => (
                <label
                  key={reason}
                  onClick={() => setRejectReason(reason)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                    rejectReason === reason
                      ? 'bg-rose-500/10 border-rose-500/40 text-white font-semibold'
                      : 'bg-white/[0.02] border-white/[0.08] text-white/70 hover:bg-white/[0.05]'
                  }`}
                >
                  <span>{reason}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    rejectReason === reason ? 'border-rose-400 bg-rose-400' : 'border-white/30'
                  }`}>
                    {rejectReason === reason && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </label>
              ))}
            </div>

            {/* Additional note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/70 font-semibold">ملاحظة توضيحية إضافية:</label>
              <textarea
                rows={2}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="أضف تفاصيل لمساعدة المصمم على فهم سبب الرفض..."
                className={`w-full p-2.5 rounded-xl bg-black/40 border ${
                  showRejectError && rejectNoteError ? 'border-red-500/60' : 'border-white/10'
                } text-white placeholder-white/40 text-xs focus:outline-none focus:border-rose-400 resize-none`}
              />
              <FieldError message={showRejectError ? rejectNoteError : undefined} />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                تأكيد الرفض وإشعار المصمم
              </button>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2.5 rounded-full bg-white/10 text-white text-xs font-semibold cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignCampaignManage;