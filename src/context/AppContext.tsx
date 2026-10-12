import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  Campaign, 
  CreatorProfile, 
  BrandProfile, 
  VideoClip, 
  Submission, 
  DesignSubmission,
  DesignComment,
  DraftItem, 
  ApplicationItem, 
  PayoutTransaction,
  SocialPlatform,
  UserRole
} from '../types';
import { 
  INITIAL_CREATOR_PROFILE, 
  INITIAL_BRAND_PROFILE, 
  MOCK_CAMPAIGNS, 
  MOCK_TOP_CLIPS, 
  MOCK_SUBMISSIONS, 
  MOCK_DESIGN_SUBMISSIONS,
  MOCK_DRAFTS, 
  MOCK_APPLICATIONS, 
  MOCK_PAYOUTS 
} from '../data/mockData';

export type CreatorScreen = 
  | 'discover' 
  | 'home' 
  | 'campaigns' 
  | 'campaigns-for-you' 
  | 'campaign-detail' 
  | 'submissions' 
  | 'drafts' 
  | 'analytics' 
  | 'earnings' 
  | 'settings';

export type BrandScreen = 
  | 'dashboard' 
  | 'campaigns' 
  | 'campaign-manage' 
  | 'create-campaign' 
  | 'analytics' 
  | 'payouts' 
  | 'applications' 
  | 'creators' 
  | 'balance' 
  | 'settings';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  creatorView: CreatorScreen;
  setCreatorView: (view: CreatorScreen) => void;
  brandView: BrandScreen;
  setBrandView: (view: BrandScreen) => void;
  
  // Data
  campaigns: Campaign[];
  submissions: Submission[];
  designSubmissions: DesignSubmission[];
  setDesignSubmissions: React.Dispatch<React.SetStateAction<DesignSubmission[]>>;
  drafts: DraftItem[];
  applications: ApplicationItem[];
  payouts: PayoutTransaction[];
  creatorProfile: CreatorProfile;
  brandProfile: BrandProfile;
  topClips: VideoClip[];

  // Selection
  selectedCampaign: Campaign | null;
  setSelectedCampaign: (campaign: Campaign | null) => void;
  selectedClip: VideoClip | null;
  setSelectedClip: (clip: VideoClip | null) => void;
  selectedSubmission: Submission | null;
  setSelectedSubmission: (sub: Submission | null) => void;

  // Modals
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isRoleSelectModalOpen: boolean;
  setIsRoleSelectModalOpen: (open: boolean) => void;
  isCreatorOnboardingOpen: boolean;
  setIsCreatorOnboardingOpen: (open: boolean) => void;
  isBrandOnboardingOpen: boolean;
  setIsBrandOnboardingOpen: (open: boolean) => void;
  isApplyModalOpen: boolean;
  setIsApplyModalOpen: (open: boolean) => void;
  isConnectAccountModalOpen: boolean;
  setIsConnectAccountModalOpen: (open: boolean) => void;
  isSubmitClipModalOpen: boolean;
  setIsSubmitClipModalOpen: (open: boolean) => void;
  isUploadDraftModalOpen: boolean;
  setIsUploadDraftModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  isFundModalOpen: boolean;
  setIsFundModalOpen: (open: boolean) => void;
  isRejectModalOpen: boolean;
  setIsRejectModalOpen: (open: boolean) => void;
  isAppealModalOpen: boolean;
  setIsAppealModalOpen: (open: boolean) => void;
  appealTarget: { type: 'video' | 'design'; item: Submission | DesignSubmission } | null;
  setAppealTarget: (target: { type: 'video' | 'design'; item: Submission | DesignSubmission } | null) => void;
  openAppealModal: (target: { type: 'video' | 'design'; item: Submission | DesignSubmission }) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: 'all' | 'clipping' | 'ugc';
  setTypeFilter: (filter: 'all' | 'clipping' | 'ugc') => void;
  platformFilter: SocialPlatform | 'all';
  setPlatformFilter: (platform: SocialPlatform | 'all') => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sortOption: string;
  setSortOption: (sort: string) => void;

  // Actions
  addSubmission: (campaignId: string, videoUrl: string, platform: SocialPlatform) => void;
  addDesignSubmission: (params: {
    campaignId: string;
    note?: string;
    previewImages: string[];
    figmaUrl?: string;
    canvaUrl?: string;
    files?: { name: string; url: string; format: string; size: string }[];
    isRevision?: boolean;
    submissionId?: string;
  }) => void;
  appealSubmission: (type: 'video' | 'design', id: string, reason: string, explanation: string, evidence?: string) => void;
  resolveAppeal: (type: 'video' | 'design', id: string, outcome: 'approved' | 'rejected') => void;
  addDraft: (draft: Partial<DraftItem>) => void;
  addCampaign: (campaign: Partial<Campaign>) => void;
  withdrawFunds: (amount: number, method: string) => void;
  fundBrandBalance: (amount: number, method: string) => void;
  approveSubmission: (submissionId: string) => void;
  rejectSubmission: (submissionId: string, reason: string) => void;
  approveDesignSubmission: (submissionId: string) => void;
  requestDesignRevision: (submissionId: string, notes: string, pinnedComments?: DesignComment[]) => void;
  rejectDesignSubmission: (submissionId: string, reason: string) => void;
  approveApplication: (appId: string) => void;
  rejectApplication: (appId: string) => void;
  connectSocialAccount: (platform: SocialPlatform, handle: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Navigation helper
  navigateToCampaignDetail: (campaign: Campaign) => void;
  toggleCampaignPause: (campaignId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('creator');
  const [creatorView, setCreatorView] = useState<CreatorScreen>('discover');
  const [brandView, setBrandView] = useState<BrandScreen>('dashboard');

  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [designSubmissions, setDesignSubmissions] = useState<DesignSubmission[]>(MOCK_DESIGN_SUBMISSIONS);
  const [drafts, setDrafts] = useState<DraftItem[]>(MOCK_DRAFTS);
  const [applications, setApplications] = useState<ApplicationItem[]>(MOCK_APPLICATIONS);
  const [payouts, setPayouts] = useState<PayoutTransaction[]>(MOCK_PAYOUTS);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile>(INITIAL_CREATOR_PROFILE);
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(INITIAL_BRAND_PROFILE);
  const [topClips] = useState<VideoClip[]>(MOCK_TOP_CLIPS);

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(MOCK_CAMPAIGNS[0]);
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isRoleSelectModalOpen, setIsRoleSelectModalOpen] = useState<boolean>(false);
  const [isCreatorOnboardingOpen, setIsCreatorOnboardingOpen] = useState<boolean>(false);
  const [isBrandOnboardingOpen, setIsBrandOnboardingOpen] = useState<boolean>(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isConnectAccountModalOpen, setIsConnectAccountModalOpen] = useState<boolean>(false);
  const [isSubmitClipModalOpen, setIsSubmitClipModalOpen] = useState<boolean>(false);
  const [isUploadDraftModalOpen, setIsUploadDraftModalOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState<boolean>(false);
  const [appealTarget, setAppealTarget] = useState<{ type: 'video' | 'design'; item: Submission | DesignSubmission } | null>(null);

  const openAppealModal = (target: { type: 'video' | 'design'; item: Submission | DesignSubmission }) => {
    setAppealTarget(target);
    setIsAppealModalOpen(true);
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'clipping' | 'ugc'>('all');
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('popular');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  const navigateToCampaignDetail = (camp: Campaign) => {
    setSelectedCampaign(camp);
    if (role === 'creator') {
      setCreatorView('campaign-detail');
    } else {
      setBrandView('campaign-manage');
    }
  };

  const toggleCampaignPause = (campaignId: string) => {
    const flip = (c: Campaign): Campaign =>
      c.id === campaignId ? { ...c, status: c.status === 'paused' ? 'live' : 'paused' } : c;
    setCampaigns((prev) => prev.map(flip));
    setSelectedCampaign((prev) => (prev ? flip(prev) : prev));
  };

  const addSubmission = (campaignId: string, videoUrl: string, platform: SocialPlatform) => {
    const targetCampaign = campaigns.find(c => c.id === campaignId) || campaigns[0];
    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      campaignId: targetCampaign.id,
      campaignTitle: targetCampaign.title,
      brandName: targetCampaign.brandName,
      platform,
      videoUrl,
      thumbnail: targetCampaign.coverImage,
      submittedAt: 'الآن',
      views: 1200,
      earnings: 9.60,
      status: 'pending',
      botScore: Math.floor(Math.random() * 4) + 1,
      linkedAccountHandle: creatorProfile.linkedAccounts.find(a => a.platform === platform)?.handle || '@noura_shortss',
      rulesPassed: [true, true, true],
    };
    setSubmissions(prev => [newSub, ...prev]);
    setCreatorProfile(prev => ({
      ...prev,
      submittedClipsCount: prev.submittedClipsCount + 1,
    }));
    showToast('تم إرسال المقطع بنجاح! سيتم فحص المشاهدات والموافقة تلقائياً');
  };

  const addDesignSubmission = (params: {
    campaignId: string;
    note?: string;
    previewImages: string[];
    figmaUrl?: string;
    canvaUrl?: string;
    files?: { name: string; url: string; format: string; size: string }[];
    isRevision?: boolean;
    submissionId?: string;
  }) => {
    const targetCampaign = campaigns.find(c => c.id === params.campaignId) || campaigns[0];
    const price = targetCampaign.designDetails?.pricePerDesign || 150;
    
    if (params.isRevision && params.submissionId) {
      setDesignSubmissions(prev => prev.map(sub => sub.id === params.submissionId ? {
        ...sub,
        status: 'pending',
        note: params.note || sub.note,
        previewImages: params.previewImages.length > 0 ? params.previewImages : sub.previewImages,
        figmaUrl: params.figmaUrl || sub.figmaUrl,
        canvaUrl: params.canvaUrl || sub.canvaUrl,
        revisionsLeft: Math.max(0, sub.revisionsLeft - 1),
        submittedAt: 'الآن (نسخة معدّلة)',
        rejectionReason: undefined,
      } : sub));
      showToast('تم رفع النسخة المعدلة بنجاح! بانتظار مراجعة واعتماد البراند.');
      return;
    }

    const newDesignSub: DesignSubmission = {
      id: `des-sub-${Date.now()}`,
      campaignId: targetCampaign.id,
      campaignTitle: targetCampaign.title,
      brandName: targetCampaign.brandName,
      brandAvatar: targetCampaign.brandAvatar,
      designerId: creatorProfile.id,
      designerName: creatorProfile.name,
      designerAvatar: creatorProfile.avatar,
      designerHandle: creatorProfile.handle,
      submittedAt: 'الآن',
      status: 'pending',
      note: params.note || 'تصميم جديد للحملة',
      previewImages: params.previewImages.length > 0 ? params.previewImages : [targetCampaign.coverImage],
      figmaUrl: params.figmaUrl,
      canvaUrl: params.canvaUrl,
      downloadableFiles: params.files,
      revisionsLeft: targetCampaign.designDetails?.revisionRoundsAllowed ?? 2,
      earnedAmount: price,
    };
    setDesignSubmissions(prev => [newDesignSub, ...prev]);
    showToast('تم إرسال تصميمك بنجاح! العلامة التجارية تشاهد تصميمك بعلامة مائية حتى يتم اعتماده.');
  };

  const appealSubmission = (type: 'video' | 'design', id: string, reason: string, explanation: string, evidence?: string) => {
    if (type === 'video') {
      setSubmissions(prev => prev.map(s => s.id === id ? {
        ...s,
        status: 'appealing',
        appealReason: reason,
        appealExplanation: explanation,
        appealStatus: 'pending',
        appealDate: 'الآن',
        evidenceFiles: evidence ? [evidence] : undefined,
      } : s));
    } else {
      setDesignSubmissions(prev => prev.map(s => s.id === id ? {
        ...s,
        status: 'appealing',
        appealReason: reason,
        appealExplanation: explanation,
        appealStatus: 'pending',
        appealDate: 'الآن',
        evidenceFiles: evidence ? [evidence] : undefined,
      } : s));
    }
    showToast('وصلنا اعتراضك، وسيقوم فريق النزاعات بالرد عليك خلال 3 أيام عمل.');
  };

  const resolveAppeal = (type: 'video' | 'design', id: string, outcome: 'approved' | 'rejected') => {
    if (type === 'video') {
      setSubmissions(prev => prev.map(s => {
        if (s.id !== id) return s;
        if (outcome === 'approved') {
          const added = s.earnings || 200;
          setCreatorProfile(cp => ({ ...cp, balance: cp.balance + added }));
          return { ...s, status: 'appeal_approved', appealStatus: 'approved' };
        } else {
          return { ...s, status: 'appeal_rejected', appealStatus: 'rejected' };
        }
      }));
    } else {
      setDesignSubmissions(prev => prev.map(s => {
        if (s.id !== id) return s;
        if (outcome === 'approved') {
          setCreatorProfile(cp => ({ ...cp, balance: cp.balance + (s.earnedAmount || 150) }));
          return { ...s, status: 'appeal_approved', appealStatus: 'approved' };
        } else {
          return { ...s, status: 'appeal_rejected', appealStatus: 'rejected' };
        }
      }));
    }
    showToast(outcome === 'approved' ? 'تم قبول الاعتراض واسترجاع الأرباح للحساب!' : 'تم رفض الاعتراض بعد المراجعة النهائية.');
  };

  const addDraft = (draft: Partial<DraftItem>) => {
    const targetCampaign = campaigns.find(c => c.id === draft.campaignId) || campaigns[0];
    const newDraft: DraftItem = {
      id: `draft-${Date.now()}`,
      campaignId: targetCampaign.id,
      campaignTitle: targetCampaign.title,
      brandName: targetCampaign.brandName,
      platform: draft.platform || 'tiktok',
      title: draft.title || 'مسودة فيديو جديدة',
      thumbnail: draft.thumbnail || targetCampaign.coverImage,
      videoUrl: draft.videoUrl,
      status: 'pending',
      submittedAt: 'الآن',
      notes: draft.notes || 'مسودة مرفوعة للموافقة المسبقة',
      chatMessages: [
        {
          sender: 'creator',
          senderName: creatorProfile.name,
          message: draft.notes || 'تم رفع المسودة للمراجعة.',
          time: 'الآن',
        }
      ],
    };
    setDrafts(prev => [newDraft, ...prev]);
    showToast('تم رفع المسودة بنجاح! بانتظار رد صاحب الحملة');
  };

  const addCampaign = (campaignData: Partial<Campaign>) => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      title: campaignData.title || 'حملة جديدة',
      brandName: brandProfile.name,
      brandAvatar: brandProfile.logo,
      isVerified: true,
      timeAgo: 'الآن',
      category: campaignData.category || 'عام',
      coverImage: campaignData.coverImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
      platforms: campaignData.platforms || ['tiktok', 'instagram'],
      requiresApplication: campaignData.requiresApplication || false,
      isNew: true,
      paymentModel: campaignData.paymentModel || 'cpm',
      ratePer1k: campaignData.ratePer1k || 7.0,
      spentBudget: 0,
      totalBudget: campaignData.totalBudget || 10000,
      participantsCount: 0,
      status: 'live',
      description: campaignData.description || 'حملة تسويقية جديدة عبر المنصة.',
      allowedTypes: campaignData.allowedTypes || ['Clipping', 'UGC بوجه'],
      dos: campaignData.dos || ['جودة تصوير عالية', 'استخدام الصوت المعتمد'],
      donts: campaignData.donts || ['عدم مخالفة الشروط'],
      payoutRules: campaignData.payoutRules || [
        { platform: 'tiktok', ratePer1k: campaignData.ratePer1k || 7.0, minPayout: 70, maxPayout: 5000 }
      ],
    };
    setCampaigns(prev => [newCamp, ...prev]);
    setBrandProfile(prev => ({
      ...prev,
      activeCampaignsCount: prev.activeCampaignsCount + 1,
      totalSpend: prev.totalSpend + (campaignData.totalBudget || 10000),
    }));
    showToast('تم إطلاق الحملة بنجاح! تظهر الآن لجميع صناع المحتوى في اكتشف');
  };

  const withdrawFunds = (amount: number, method: string) => {
    if (amount > creatorProfile.balance) {
      showToast('المبلغ المطلوب أكبر من الرصيد المتاح');
      return;
    }
    setCreatorProfile(prev => ({
      ...prev,
      balance: prev.balance - amount,
      totalWithdrawn: prev.totalWithdrawn + amount,
    }));
    const newTx: PayoutTransaction = {
      id: `tx-${Date.now()}`,
      creatorName: creatorProfile.name,
      creatorAvatar: creatorProfile.avatar,
      amount,
      platform: 'tiktok',
      campaignTitle: 'سحب أرباح شخصي',
      date: 'اليوم',
      status: 'completed',
      method,
    };
    setPayouts(prev => [newTx, ...prev]);
    showToast(`تم سحب ${amount.toLocaleString()} <RiyalSymbol /> بنجاح إلى ${method}`);
  };

  const fundBrandBalance = (amount: number, method: string) => {
    setBrandProfile(prev => ({
      ...prev,
      balance: prev.balance + amount,
    }));
    showToast(`تم إضافة ${amount.toLocaleString()} <RiyalSymbol /> إلى رصيد المنظمة عبر ${method}`);
  };

  const approveSubmission = (submissionId: string) => {
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: 'approved' } : s));
    showToast('تم قبول المقطع واعتماد المستحقات لصانع المحتوى');
  };

  const rejectSubmission = (submissionId: string, reason: string) => {
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: 'rejected', rejectionReason: reason } : s));
    showToast('تم رفض المقطع وإرسال السبب إلى صانع المحتوى');
  };

  const approveDesignSubmission = (submissionId: string) => {
    let targetCampaignId = '';
    let payoutAmount = 150;
    setDesignSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        targetCampaignId = s.campaignId;
        payoutAmount = s.earnedAmount || 150;
        return { ...s, status: 'approved' };
      }
      return s;
    }));

    if (targetCampaignId) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === targetCampaignId) {
          const currentAccepted = c.designDetails?.acceptedDesignsCount ?? 0;
          const nextAccepted = currentAccepted + 1;
          const nextSpent = c.spentBudget + payoutAmount;
          return {
            ...c,
            spentBudget: nextSpent,
            designDetails: c.designDetails ? {
              ...c.designDetails,
              acceptedDesignsCount: nextAccepted,
            } : undefined,
          };
        }
        return c;
      }));

      setSelectedCampaign(curr => {
        if (!curr || curr.id !== targetCampaignId) return curr;
        const currentAccepted = curr.designDetails?.acceptedDesignsCount ?? 0;
        return {
          ...curr,
          spentBudget: curr.spentBudget + payoutAmount,
          designDetails: curr.designDetails ? {
            ...curr.designDetails,
            acceptedDesignsCount: currentAccepted + 1,
          } : undefined,
        };
      });
    }

    showToast('تم اعتماد التصميم وصرف 150 <RiyalSymbol /> للمصمم');
  };

  const requestDesignRevision = (submissionId: string, notes: string, pinnedComments?: DesignComment[]) => {
    setDesignSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        const nextRevisions = Math.max(0, (s.revisionsLeft ?? 2) - 1);
        const existingComments = s.comments || [];
        const nextComments = pinnedComments ? [...existingComments, ...pinnedComments] : existingComments;
        return {
          ...s,
          status: 'needs_revision',
          brandComment: notes,
          comments: nextComments,
          revisionsLeft: nextRevisions,
        };
      }
      return s;
    }));
    showToast('تم إرسال طلب التعديل والملاحظات للمصمم بنجاح.');
  };

  const rejectDesignSubmission = (submissionId: string, reason: string) => {
    setDesignSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          status: 'rejected',
          rejectionReason: reason,
        };
      }
      return s;
    }));
    showToast('تم رفض التصميم وتوضيح السبب للمصمم.');
  };

  const approveApplication = (appId: string) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));
    showToast('تم قبول طلب صانع المحتوى بنجاح');
  };

  const rejectApplication = (appId: string) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a));
    showToast('تم رفض طلب الانضمام');
  };

  const connectSocialAccount = (platform: SocialPlatform, handle: string) => {
    setCreatorProfile(prev => ({
      ...prev,
      linkedAccounts: prev.linkedAccounts.map(acc => 
        acc.platform === platform ? { ...acc, handle, connected: true } : acc
      )
    }));
    showToast(`تم ربط حسابك في ${platform} (${handle}) بنجاح!`);
  };

  const value = useMemo(() => ({
    role,
    setRole,
    creatorView,
    setCreatorView,
    brandView,
    setBrandView,
    campaigns,
    submissions,
    designSubmissions,
    setDesignSubmissions,
    drafts,
    applications,
    payouts,
    creatorProfile,
    brandProfile,
    topClips,
    selectedCampaign,
    setSelectedCampaign,
    selectedClip,
    setSelectedClip,
    selectedSubmission,
    setSelectedSubmission,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isRoleSelectModalOpen,
    setIsRoleSelectModalOpen,
    isCreatorOnboardingOpen,
    setIsCreatorOnboardingOpen,
    isBrandOnboardingOpen,
    setIsBrandOnboardingOpen,
    isApplyModalOpen,
    setIsApplyModalOpen,
    isConnectAccountModalOpen,
    setIsConnectAccountModalOpen,
    isSubmitClipModalOpen,
    setIsSubmitClipModalOpen,
    isUploadDraftModalOpen,
    setIsUploadDraftModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    isFundModalOpen,
    setIsFundModalOpen,
    isRejectModalOpen,
    setIsRejectModalOpen,
    isAppealModalOpen,
    setIsAppealModalOpen,
    appealTarget,
    setAppealTarget,
    openAppealModal,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    platformFilter,
    setPlatformFilter,
    categoryFilter,
    setCategoryFilter,
    sortOption,
    setSortOption,
    addSubmission,
    addDesignSubmission,
    appealSubmission,
    resolveAppeal,
    addDraft,
    addCampaign,
    withdrawFunds,
    fundBrandBalance,
    approveSubmission,
    rejectSubmission,
    approveDesignSubmission,
    requestDesignRevision,
    rejectDesignSubmission,
    approveApplication,
    rejectApplication,
    connectSocialAccount,
    toastMessage,
    showToast,
    navigateToCampaignDetail,
    toggleCampaignPause,
  }), [
    role,
    creatorView,
    brandView,
    campaigns,
    submissions,
    designSubmissions,
    drafts,
    applications,
    payouts,
    creatorProfile,
    brandProfile,
    topClips,
    selectedCampaign,
    selectedClip,
    selectedSubmission,
    isLoginModalOpen,
    isRoleSelectModalOpen,
    isCreatorOnboardingOpen,
    isBrandOnboardingOpen,
    isApplyModalOpen,
    isConnectAccountModalOpen,
    isSubmitClipModalOpen,
    isUploadDraftModalOpen,
    isWithdrawModalOpen,
    isFundModalOpen,
    isRejectModalOpen,
    isAppealModalOpen,
    appealTarget,
    searchQuery,
    typeFilter,
    platformFilter,
    categoryFilter,
    sortOption,
    toastMessage,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
