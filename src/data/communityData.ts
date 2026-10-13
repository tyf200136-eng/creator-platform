import { CommunityPost, CommunityQuestion } from '../types';

// البراند اللي داخل حالياً (لاحقاً يجي من تسجيل الدخول)
export const MY_BRAND_NAME = 'دخون العشب';

// أعضاء المجتمع (عيّنة لقائمة الأعضاء عند البراند)
export interface CommunityMember {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  joinedAt: string;
  isParticipant: boolean; // مشارك في حملة للبراند
}

export const MOCK_COMMUNITY_MEMBER_LIST: Record<string, CommunityMember[]> = {
  'دخون العشب': [
    { id: 'c_sultan', name: 'سلطان القحطاني', handle: '@sultan_q', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', joinedAt: 'منذ شهر', isParticipant: true },
    { id: 'c_sara', name: 'سارة المهيدب', handle: '@sara.mh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', joinedAt: 'منذ 3 أسابيع', isParticipant: true },
    { id: 'c_khaled', name: 'خالد الزهراني', handle: '@khaled_z', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', joinedAt: 'منذ أسبوعين', isParticipant: false },
    { id: 'c_reem', name: 'ريم العتيبي', handle: '@reem.creates', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80', joinedAt: 'منذ 5 أيام', isParticipant: false },
  ],
};

// عدد أعضاء مجتمع كل براند
export const MOCK_COMMUNITY_MEMBERS: Record<string, number> = {
  'دخون العشب': 1240,
  'ريف العطور': 860,
  'عنوان القهوة': 410,
};

// الإعلانات (البراند بس ينشر)
export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    brandName: 'دخون العشب',
    text: 'تذكير لكل المشاركين في حملة إمبريال البري: المقاطع اللي يظهر فيها العطر من أول ثواني تحقق مشاهدات أعلى بكثير. ارجعوا لإرشادات الحملة قبل التصوير.',
    campaignId: 'camp-1',
    isPinned: true,
    createdAt: 'منذ ساعتين',
    likes: 48,
  },
  {
    id: 'post-2',
    brandName: 'دخون العشب',
    text: 'شكراً لكل اللي شاركوا هالأسبوع! هذي من أكثر اللقطات اللي عجبتنا. الإضاءة الدافية مع الزجاجة كانت فكرة ممتازة.',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&auto=format&fit=crop&q=80',
    ],
    isPinned: false,
    createdAt: 'منذ يومين',
    likes: 132,
  },
  {
    id: 'post-3',
    brandName: 'ريف العطور',
    text: 'حملة ريف 33 الصيفية انطلقت! نبي محتوى منعش يحس فيه المشاهد بالصيف من أول لقطة.',
    campaignId: 'camp-7',
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80'],
    isPinned: true,
    createdAt: 'اليوم',
    likes: 64,
  },
  {
    id: 'post-4',
    brandName: 'ريف العطور',
    text: 'نصيحة: الإضاءة الطبيعية وقت العصر تطلع لون الزجاجة الأزرق بأجمل شكل.',
    isPinned: false,
    createdAt: 'منذ 3 أيام',
    likes: 21,
  },
];

// الأسئلة والأجوبة (المشاركين يسألون، البراند يجاوب قدام الكل)
export const MOCK_COMMUNITY_QUESTIONS: CommunityQuestion[] = [
  {
    id: 'q-1',
    brandName: 'دخون العشب',
    authorId: 'c_sultan',
    authorName: 'سلطان القحطاني',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    question: 'هل أقدر أستخدم موسيقى ترند في المقطع؟',
    answer: 'أي موسيقى من المكتبة التجارية في تيك توك وسناب مسموحة. تجنب الأغاني المحمية عشان ما ينحذف المقطع.',
    isFaq: true,
    createdAt: 'منذ أسبوع',
  },
  {
    id: 'q-2',
    brandName: 'دخون العشب',
    authorId: 'c_sara',
    authorName: 'سارة المهيدب',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    question: 'كم مقطع أقدر أرسل في اليوم؟',
    answer: 'لين 3 مقاطع يومياً لكل حساب مربوط.',
    isFaq: false,
    createdAt: 'منذ 3 أيام',
  },
  {
    id: 'q-4',
    brandName: 'دخون العشب',
    authorId: 'c_reem',
    authorName: 'ريم العتيبي',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    question: 'هل تحسب المشاهدات من سناب ستوري ولا بس من سبوتلايت؟',
    isFaq: false,
    createdAt: 'منذ 4 ساعات',
  },
  {
    id: 'q-3',
    brandName: 'ريف العطور',
    authorId: 'c_khaled',
    authorName: 'خالد الزهراني',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    question: 'هل لازم يظهر وجهي في المقطع؟',
    answer: 'لا، نقبل UGC بوجه أو بدون وجه، المهم تظهر الزجاجة بوضوح.',
    isFaq: true,
    createdAt: 'منذ يومين',
  },
];