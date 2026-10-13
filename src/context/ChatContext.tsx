import React, { createContext, useContext, useState } from 'react';
import { ChatAttachment, ChatSide, Conversation } from '../types';
import { MOCK_CONVERSATIONS } from '../data/chatData';
import { MY_BRAND_NAME } from '../data/communityData';
import { maskContacts, MASK_WARNING } from '../utils/maskContacts';
import { useApp } from './AppContext';
import { useNotifications } from './NotificationsContext';

interface ChatContextType {
  side: ChatSide;                          // من أي جهة أنا الحين
  myConversations: Conversation[];         // محادثاتي حسب الدور
  unreadTotal: number;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  openConversation: (id: string) => void;  // تفتح المحادثة وتعلّمها مقروءة

  // بدء محادثة
  canMessageBrand: (brandName: string) => boolean;
  openChatWithBrand: (brandName: string, campaignId?: string) => void;
  openChatAsBrand: (creator: { creatorId: string; creatorName: string; creatorAvatar: string; campaignId?: string }) => void;

  // الإرسال
  sendMessage: (conversationId: string, text: string, attachments?: ChatAttachment[]) => void;

  // الحماية
  reportConversation: (conversationId: string) => void;
  toggleBlock: (conversationId: string) => void;
  acceptNewMessages: boolean;              // إعداد البراند
  setAcceptNewMessages: (v: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, creatorProfile, campaigns, myParticipations, setCreatorView, setBrandView, showToast } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [acceptNewMessages, setAcceptNewMessages] = useState(true);
  const { notify } = useNotifications();

  const side: ChatSide = role === 'brand' ? 'brand' : 'creator';

  const myConversations = conversations
    .filter((c) => (side === 'brand' ? c.brandName === MY_BRAND_NAME : c.creatorId === creatorProfile.id))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const unreadTotal = myConversations.reduce((sum, c) => sum + c.unread[side], 0);

  const update = (id: string, fn: (c: Conversation) => Conversation) =>
    setConversations((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));

  const goToMessages = () => {
    if (side === 'brand') setBrandView('messages');
    else setCreatorView('messages');
    window.scrollTo({ top: 0 });
  };

  const openConversation = (id: string) => {
    setActiveId(id);
    update(id, (c) => ({ ...c, unread: { ...c.unread, [side]: 0 } }));
  };

  // صانع المحتوى يراسل البراند فقط إذا كان مشارك (أو شارك) في حملة له
  const canMessageBrand = (brandName: string) =>
    campaigns.some(
      (c) =>
        c.brandName === brandName &&
        myParticipations.some((p) => p.campaignId === c.id && (p.status === 'joined' || p.status === 'ended'))
    );

  const openChatWithBrand = (brandName: string, campaignId?: string) => {
    const existing = conversations.find((c) => c.creatorId === creatorProfile.id && c.brandName === brandName);
    if (existing) {
      openConversation(existing.id);
      goToMessages();
      return;
    }
    if (!canMessageBrand(brandName)) {
      showToast('المراسلة متاحة للمشاركين في حملات هذا البراند');
      return;
    }
    // البراند قفل استقبال الرسائل الجديدة (المحادثات القديمة تبقى شغالة)
    if (brandName === MY_BRAND_NAME && !acceptNewMessages) {
      showToast(`${brandName} موقف استقبال الرسائل الجديدة حالياً`);
      return;
    }
    const brandAvatar = campaigns.find((c) => c.brandName === brandName)?.brandAvatar ?? '';
    const conv: Conversation = {
      id: `conv-${Date.now()}`,
      creatorId: creatorProfile.id,
      creatorName: creatorProfile.name,
      creatorAvatar: creatorProfile.avatar,
      brandName,
      brandAvatar,
      campaignId,
      messages: [],
      unread: { creator: 0, brand: 0 },
      updatedAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    goToMessages();
  };

  const openChatAsBrand: ChatContextType['openChatAsBrand'] = ({ creatorId, creatorName, creatorAvatar, campaignId }) => {
    const existing = conversations.find((c) => c.brandName === MY_BRAND_NAME && c.creatorId === creatorId);
    if (existing) {
      openConversation(existing.id);
      goToMessages();
      return;
    }
    const brandAvatar = campaigns.find((c) => c.brandName === MY_BRAND_NAME)?.brandAvatar ?? '';
    const conv: Conversation = {
      id: `conv-${Date.now()}`,
      creatorId,
      creatorName,
      creatorAvatar,
      brandName: MY_BRAND_NAME,
      brandAvatar,
      campaignId,
      messages: [],
      unread: { creator: 0, brand: 0 },
      updatedAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    goToMessages();
  };

  const sendMessage = (conversationId: string, rawText: string, attachments?: ChatAttachment[]) => {
    const { text, masked } = maskContacts(rawText.trim());
    if (!text && !attachments?.length) return;
    const other: ChatSide = side === 'brand' ? 'creator' : 'brand';
    const time = new Date().toLocaleTimeString('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit' });
    update(conversationId, (c) => ({
      ...c,
      messages: [
        ...c.messages,
        { id: `m-${Date.now()}`, from: side, text: text || undefined, attachments, createdAt: time, masked },
      ],
      unread: { ...c.unread, [other]: c.unread[other] + 1 },
      updatedAt: Date.now(),
    }));
    if (masked) showToast(MASK_WARNING);

    // إشعار للطرف الثاني
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      const sender = side === 'brand' ? conv.brandName : conv.creatorName;
      notify({
        side: other,
        kind: 'message',
        title: `رسالة جديدة من ${sender}`,
        body: text || `مرفق: ${attachments?.[0]?.name ?? ''}`,
        target: { type: 'chat', conversationId },
      });
    }
  };

  const reportConversation = (_conversationId: string) => {
    showToast('وصل بلاغك لفريق المنصة، وراح نراجع المحادثة');
  };

  const toggleBlock = (conversationId: string) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;
    if (conv.blockedBy && conv.blockedBy !== side) return; // الطرف الثاني هو اللي حاظر
    const blocking = conv.blockedBy !== side;
    update(conversationId, (c) => ({ ...c, blockedBy: blocking ? side : undefined }));
    showToast(blocking ? 'تم الحظر، ما راح توصلك رسائل من هذي المحادثة' : 'تم إلغاء الحظر');
  };

  const value: ChatContextType = {
    side,
    myConversations,
    unreadTotal,
    activeId,
    setActiveId,
    openConversation,
    canMessageBrand,
    openChatWithBrand,
    openChatAsBrand,
    sendMessage,
    reportConversation,
    toggleBlock,
    acceptNewMessages,
    setAcceptNewMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
};