export type SocialPlatform = 'tiktok' | 'instagram' | 'youtube' | 'snapchat' | 'x';

export type UserRole = 'creator' | 'brand';

export type CampaignType = 'video' | 'design';

export type PaymentModel = 'cpm' | 'retainer' | 'per_post' | 'design_fixed';

export type CampaignStatus = 'live' | 'scheduled' | 'draft' | 'paused' | 'ended' | 'almost_full';

export type SubmissionStatus = 
  | 'approved' 
  | 'pending' 
  | 'rejected' 
  | 'history' 
  | 'appealing' 
  | 'appeal_approved' 
  | 'appeal_rejected';

export type DraftStatus = 'needs_edit' | 'pending' | 'approved' | 'published' | 'rejected';

export type DesignSubmissionStatus = 
  | 'pending' 
  | 'needs_revision' 
  | 'approved' 
  | 'rejected' 
  | 'appealing' 
  | 'appeal_approved' 
  | 'appeal_rejected';

export interface DesignComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  x?: number; // Pin X % (0-100)
  y?: number; // Pin Y % (0-100)
}

export interface DesignSubmission {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  brandAvatar?: string;
  designerId: string;
  designerName: string;
  designerAvatar: string;
  designerHandle: string;
  submittedAt: string;
  status: DesignSubmissionStatus;
  note: string;
  previewImages: string[];
  downloadableFiles?: { name: string; url: string; format: string; size: string }[];
  figmaUrl?: string;
  canvaUrl?: string;
  revisionsLeft: number;
  comments?: DesignComment[];
  brandComment?: string;
  earnedAmount: number;
  rejectionReason?: string;
  appealReason?: string;
  appealExplanation?: string;
  appealStatus?: 'pending' | 'approved' | 'rejected';
  appealDate?: string;
  evidenceFiles?: string[];
}

export interface DesignDetails {
  exactCopy?: string;
  sizes: string[]; // e.g. ['بوست 1080×1350', 'ستوري 1080×1920']
  customWidth?: number;
  customHeight?: number;
  carouselSlidesCount?: number;
  formats: string[]; // e.g. ['PNG عالي الدقة', 'ملف PSD', 'رابط Figma']
  brandColors?: string[]; // hex codes e.g. ['#FFFFFF', '#D97706', '#0A0A0A']
  brandFonts?: string;
  brandKitUrls?: string[];
  productPhotoUrls?: string[];
  referenceExamples?: string[];
  isBundle?: boolean; // التسليم مجموعة واحدة
  pricePerDesign: number; // e.g. 150
  totalDesignsNeeded: number; // e.g. 10
  acceptedDesignsCount: number; // e.g. 3
  deadline: string; // e.g. 'باقي 4 أيام'
  revisionRoundsAllowed: number; // 0 | 1 | 2
}

export interface Campaign {
  id: string;
  title: string;
  brandName: string;
  brandAvatar: string;
  isVerified: boolean;
  timeAgo: string;
  category: string;
  coverImage: string;
  platforms: SocialPlatform[];
  requiresApplication: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  trendingRank?: number;
  campaignType?: CampaignType; // 'video' | 'design'
  paymentModel: PaymentModel;
  ratePer1k: number; // in SAR (for video)
  spentBudget: number; // in SAR
  totalBudget: number; // in SAR
  participantsCount: number;
  status: CampaignStatus;
  description: string;
  allowedTypes: string[];
  startDate?: string;
  endDate?: string;
  designDetails?: DesignDetails;
  referenceLinks?: { title: string; url: string; type: 'drive' | 'notion' | 'brief' | 'video' }[];
  dos: string[];
  donts: string[];
  payoutRules: {
    platform: SocialPlatform;
    ratePer1k: number;
    minPayout: number;
    maxPayout: number;
  }[];
  topCreators?: {
    rank: number;
    name: string;
    avatar: string;
    earnings: number;
    views: string;
    verified: boolean;
  }[];
  requirePreApproval?: boolean;
}

export interface VideoClip {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  creatorName: string;
  creatorAvatar: string;
  thumbnail: string;
  videoUrl?: string;
  views: number;
  viewsFormatted: string;
  platform: SocialPlatform;
  likes: string;
  comments: string;
  earnings: number;
  postedTimeAgo: string;
  botScore?: number; // 0-100
}

export interface Submission {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  platform: SocialPlatform;
  videoUrl: string;
  thumbnail: string;
  submittedAt: string;
  views: number;
  earnings: number;
  status: SubmissionStatus;
  botScore: number;
  rejectionReason?: string;
  appealReason?: string;
  appealExplanation?: string;
  appealStatus?: 'pending' | 'approved' | 'rejected';
  appealDate?: string;
  evidenceFiles?: string[];
  linkedAccountHandle: string;
  rulesPassed: boolean[];
}

export interface DraftItem {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  platform: SocialPlatform;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  status: DraftStatus;
  feedback?: string;
  submittedAt: string;
  notes?: string;
  chatMessages: {
    sender: 'brand' | 'creator';
    senderName: string;
    message: string;
    time: string;
  }[];
}

export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  discordHandle?: string;
  balance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  totalViews: string;
  activeCampaignsCount: number;
  submittedClipsCount: number;
  linkedAccounts: {
    platform: SocialPlatform;
    handle: string;
    followers: string;
    connected: boolean;
  }[];
}

export interface BrandProfile {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  phone: string;
  industry: string;
  balance: number;
  totalSpend: number;
  totalViews: string;
  activeCampaignsCount: number;
  teamMembers: {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'manager' | 'supervisor' | 'viewer';
  }[];
}

export interface ApplicationItem {
  id: string;
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
  platforms: { platform: SocialPlatform; followers: string }[];
  motivation: string;
  screeningAnswer: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  pastViews: string;
}

export interface PayoutTransaction {
  id: string;
  creatorName: string;
  creatorAvatar: string;
  amount: number;
  platform: SocialPlatform;
  campaignTitle: string;
  date: string;
  status: 'completed' | 'pending' | 'blocked';
  method: string;
}

export type ParticipationStatus = 'joined' | 'pending_approval' | 'rejected' | 'ended';


export type WorkStatus = 'none' | 'submitted' | 'needs_revision';

export interface MyParticipation {
  campaignId: string;
  status: ParticipationStatus;
  workStatus: WorkStatus;
}


// صفحة البراند العامة (يشوفها صانع المحتوى)
export interface BrandPage {
  brandName: string;   // نفس brandName في الحملات
  cover: string;
  bio: string;
  industry: string;
  website?: string;
}