import { Conversation } from '../types';

const NOURA = {
  creatorId: 'c_noura',
  creatorName: 'نورة الدوسري',
  creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
};
const DKHOON = {
  brandName: 'دخون العشب',
  brandAvatar: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=100&auto=format&fit=crop&q=80',
};

const now = Date.now();
const minutes = (m: number) => now - m * 60_000;

// محادثات تجريبية: نورة (صانعة محتوى) + براند دخون العشب
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    ...NOURA,
    ...DKHOON,
    campaignId: 'camp-1',
    messages: [
      { id: 'm1', from: 'brand', text: 'هلا نورة، مقطعك الأخير عجبنا مرة! حابين نعرف إذا تقدرين تسوين نسخة ثانية بإضاءة المساء؟', createdAt: '10:12 ص' },
      { id: 'm2', from: 'creator', text: 'أكيد! أصورها اليوم وأرسلها لكم بكرة إن شاء الله', createdAt: '10:20 ص' },
      { id: 'm3', from: 'brand', text: 'ممتاز، ولا تنسين يظهر اسم العطر واضح', createdAt: '10:21 ص' },
    ],
    unread: { creator: 1, brand: 0 },
    updatedAt: minutes(25),
  },
  {
    id: 'conv-2',
    ...NOURA,
    brandName: 'عنوان القهوة',
    brandAvatar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&auto=format&fit=crop&q=80',
    campaignId: 'camp-2',
    messages: [
      { id: 'm1', from: 'creator', text: 'السلام عليكم، هل أقدر أصور داخل الفرع ولا لازم في البيت؟', createdAt: 'أمس' },
      { id: 'm2', from: 'brand', text: 'وعليكم السلام، الاثنين مسموح. إذا داخل الفرع بلغينا قبلها عشان نجهز لك الطاولة', createdAt: 'أمس' },
    ],
    unread: { creator: 0, brand: 0 },
    updatedAt: minutes(60 * 20),
  },
  {
    id: 'conv-3',
    creatorId: 'c_sultan',
    creatorName: 'سلطان القحطاني',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    ...DKHOON,
    campaignId: 'camp-1',
    messages: [
      { id: 'm1', from: 'creator', text: 'هل فيه مكافأة إضافية لأعلى مقطع هالأسبوع؟', createdAt: '9:40 ص' },
    ],
    unread: { creator: 0, brand: 1 },
    updatedAt: minutes(90),
  },
  {
    id: 'conv-4',
    creatorId: 'c_reem',
    creatorName: 'ريم العتيبي',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    ...DKHOON,
    messages: [
      { id: 'm1', from: 'brand', text: 'هلا ريم، شفنا محتواك في المجتمع ونحب نعزمك على حملتنا الجاية', createdAt: 'منذ يومين' },
    ],
    unread: { creator: 0, brand: 0 },
    updatedAt: minutes(60 * 48),
  },
];