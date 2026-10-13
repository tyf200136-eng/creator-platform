import React, { createContext, useContext, useState } from 'react';
import { CommunityPost, CommunityQuestion, BrandPage } from '../types';
import {
  MOCK_COMMUNITY_POSTS,
  MOCK_COMMUNITY_QUESTIONS,
  MOCK_COMMUNITY_MEMBERS,
  MOCK_COMMUNITY_MEMBER_LIST,
  CommunityMember,
  MY_BRAND_NAME,
} from '../data/communityData';
import { MOCK_BRAND_PAGES } from '../data/mockData';
import { useApp } from './AppContext';
import { useNotifications } from './NotificationsContext';

// كل منطق المجتمع في ملف مستقل عشان ما نكبّر AppContext
interface CommunityContextType {
  posts: CommunityPost[];
  questions: CommunityQuestion[];

  // الإعجاب
  isLiked: (postId: string) => boolean;
  toggleLike: (postId: string) => void;

  // العضوية
  isMember: (brandName: string) => boolean;
  toggleMembership: (brandName: string) => void;
  memberCount: (brandName: string) => number;

  // الأسئلة
  canAsk: (brandName: string) => boolean;
  askQuestion: (brandName: string, text: string) => void;
  visibleQuestions: (brandName: string) => CommunityQuestion[];

  // صفحة البراند (الغلاف، النبذة، الروابط)
  getBrandPage: (brandName: string) => BrandPage | undefined;
  updateBrandPage: (brandName: string, patch: Partial<BrandPage>) => void;

  // جهة البراند: إدارة المجتمع
  addPost: (post: Omit<CommunityPost, 'id' | 'likes' | 'createdAt'>) => void;
  deletePost: (postId: string) => void;
  togglePin: (postId: string) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  toggleFaq: (questionId: string) => void;
  membersOf: (brandName: string) => CommunityMember[];
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { campaigns, myParticipations, creatorProfile, showToast } = useApp();
  const { notify } = useNotifications();

  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  const [questions, setQuestions] = useState<CommunityQuestion[]>(MOCK_COMMUNITY_QUESTIONS);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [memberOf, setMemberOf] = useState<string[]>(['دخون العشب']);
  const [brandPages, setBrandPages] = useState<BrandPage[]>(MOCK_BRAND_PAGES);

  const toggleIn = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  // ---------- الإعجاب ----------
  const isLiked = (postId: string) => likedIds.includes(postId);
  const toggleLike = (postId: string) => setLikedIds((prev) => toggleIn(prev, postId));

  // ---------- العضوية ----------
  const isMember = (brandName: string) => memberOf.includes(brandName);
  const toggleMembership = (brandName: string) => {
    const joining = !memberOf.includes(brandName);
    setMemberOf((prev) => toggleIn(prev, brandName));
    if (joining && brandName === MY_BRAND_NAME) {
      notify({
        side: 'brand',
        kind: 'member',
        title: 'عضو جديد انضم لمجتمعك',
        body: `${creatorProfile.name} انضم لمجتمع ${brandName}`,
        target: { type: 'brand-page', tab: 'members' },
      });
    }
    showToast(joining ? `انضممت لمجتمع ${brandName}، بيوصلك كل إعلان جديد` : `غادرت مجتمع ${brandName}`);
  };
  const memberCount = (brandName: string) =>
    (MOCK_COMMUNITY_MEMBERS[brandName] ?? 0) + (memberOf.includes(brandName) ? 1 : 0);

  // ---------- الأسئلة ----------
  // يسأل فقط اللي مشارك (أو شارك) في حملة لهذا البراند
  const canAsk = (brandName: string) =>
    campaigns.some(
      (c) =>
        c.brandName === brandName &&
        myParticipations.some(
          (p) => p.campaignId === c.id && (p.status === 'joined' || p.status === 'ended')
        )
    );

  const askQuestion = (brandName: string, text: string) => {
    setQuestions((prev) => [
      {
        id: `q-${Date.now()}`,
        brandName,
        authorId: creatorProfile.id,
        authorName: creatorProfile.name,
        authorAvatar: creatorProfile.avatar,
        question: text,
        isFaq: false,
        createdAt: 'الآن',
      },
      ...prev,
    ]);
    showToast('وصل سؤالك! بيظهر للجميع أول ما يرد البراند');
    if (brandName === MY_BRAND_NAME) {
      notify({
        side: 'brand',
        kind: 'question',
        title: 'سؤال جديد في المجتمع',
        body: `${creatorProfile.name}: ${text}`,
        target: { type: 'brand-page', tab: 'questions' },
      });
    }
  };

  // المجاب عليها للكل + أسئلتي اللي ما انرد عليها (أشوفها أنا بس)
  const visibleQuestions = (brandName: string) =>
    questions.filter(
      (q) => q.brandName === brandName && (q.answer || q.authorId === creatorProfile.id)
    );

  // ---------- صفحة البراند ----------
  const getBrandPage = (brandName: string) => brandPages.find((b) => b.brandName === brandName);
  const updateBrandPage = (brandName: string, patch: Partial<BrandPage>) =>
    setBrandPages((prev) => {
      const exists = prev.some((b) => b.brandName === brandName);
      if (exists) return prev.map((b) => (b.brandName === brandName ? { ...b, ...patch } : b));
      return [...prev, { brandName, cover: '', bio: '', industry: '', ...patch }];
    });

  // ---------- جهة البراند ----------
  const addPost = (post: Omit<CommunityPost, 'id' | 'likes' | 'createdAt'>) => {
    setPosts((prev) => [{ ...post, id: `post-${Date.now()}`, likes: 0, createdAt: 'الآن' }, ...prev]);
    // يوصل لأعضاء المجتمع
    if (memberOf.includes(post.brandName)) {
      notify({
        side: 'creator',
        kind: 'announcement',
        title: `إعلان جديد من ${post.brandName}`,
        body: post.text,
        target: { type: 'brand-profile', brandName: post.brandName },
      });
    }
  };
  const deletePost = (postId: string) => setPosts((prev) => prev.filter((p) => p.id !== postId));
  const togglePin = (postId: string) =>
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p)));
  const answerQuestion = (questionId: string, answer: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, answer } : q)));
    // إذا السؤال لصانع المحتوى الحالي يوصله إشعار
    const q = questions.find((x) => x.id === questionId);
    if (q && q.authorId === creatorProfile.id) {
      notify({
        side: 'creator',
        kind: 'answer',
        title: `${q.brandName} رد على سؤالك`,
        body: answer,
        target: { type: 'brand-profile', brandName: q.brandName },
      });
    }
  };
  const toggleFaq = (questionId: string) =>
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, isFaq: !q.isFaq } : q)));

  // قائمة الأعضاء (+ صانع المحتوى الحالي إذا انضم)
  const membersOf = (brandName: string): CommunityMember[] => {
    const list = MOCK_COMMUNITY_MEMBER_LIST[brandName] ?? [];
    if (!memberOf.includes(brandName)) return list;
    const me: CommunityMember = {
      id: creatorProfile.id,
      name: creatorProfile.name,
      handle: creatorProfile.handle,
      avatar: creatorProfile.avatar,
      joinedAt: 'مؤخراً',
      isParticipant: canAsk(brandName),
    };
    return [me, ...list];
  };

  const value: CommunityContextType = {
    posts,
    questions,
    isLiked,
    toggleLike,
    isMember,
    toggleMembership,
    memberCount,
    canAsk,
    askQuestion,
    visibleQuestions,
    getBrandPage,
    updateBrandPage,
    addPost,
    deletePost,
    togglePin,
    answerQuestion,
    toggleFaq,
    membersOf,
  };

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
};

export const useCommunity = () => {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used inside CommunityProvider');
  return ctx;
};