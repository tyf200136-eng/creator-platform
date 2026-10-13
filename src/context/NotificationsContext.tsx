import React, { createContext, useContext, useState } from 'react';
import { ChatSide } from '../types';

// وين يودّي الإشعار لما ينضغط
export type NotificationTarget =
  | { type: 'chat'; conversationId: string }
  | { type: 'brand-profile'; brandName: string }      // صانع المحتوى ← مجتمع البراند
  | { type: 'brand-page'; tab: 'questions' | 'members' | 'announcements' } // البراند ← ملف العلامة
  | { type: 'none' };

export type NotificationKind = 'message' | 'announcement' | 'answer' | 'question' | 'member' | 'system';

export interface AppNotification {
  id: string;
  side: ChatSide;        // لمين الإشعار
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  target: NotificationTarget;
}

const INITIAL: AppNotification[] = [
  // صانع المحتوى
  { id: 'n1', side: 'creator', kind: 'announcement', title: 'إعلان جديد من دخون العشب', body: 'شكراً لكل اللي شاركوا هالأسبوع! هذي من أكثر اللقطات اللي عجبتنا.', time: 'قبل ساعتين', read: false, target: { type: 'brand-profile', brandName: 'دخون العشب' } },
  { id: 'n2', side: 'creator', kind: 'system', title: 'تم اعتماد مقطعك', body: 'حققت 84,200 مشاهدة في حملة عطر إمبريال البري وانضاف المبلغ لرصيدك.', time: 'قبل 3 ساعات', read: true, target: { type: 'none' } },
  { id: 'n3', side: 'creator', kind: 'system', title: 'ملاحظة على المسودة', body: 'براند جاهز طلب تعديل بسيط على شاشة الختام قبل نشر المقطع.', time: 'أمس', read: true, target: { type: 'none' } },
  // البراند
  { id: 'n4', side: 'brand', kind: 'question', title: 'سؤال جديد في المجتمع', body: 'ريم العتيبي: هل تحسب المشاهدات من سناب ستوري ولا بس من سبوتلايت؟', time: 'قبل 4 ساعات', read: false, target: { type: 'brand-page', tab: 'questions' } },
  { id: 'n5', side: 'brand', kind: 'member', title: 'عضو جديد انضم لمجتمعك', body: 'ريم العتيبي انضمت لمجتمع دخون العشب', time: 'قبل 5 أيام', read: true, target: { type: 'brand-page', tab: 'members' } },
];

interface NotificationsContextType {
  notifications: AppNotification[];
  notify: (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: (side: ChatSide) => void;

  // تبويب ينفتح تلقائياً بعد الضغط على إشعار
  pendingTab: string | null;
  setPendingTab: (tab: string | null) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const notify: NotificationsContextType['notify'] = (n) =>
    setNotifications((prev) => [{ ...n, id: `n-${Date.now()}-${Math.random()}`, time: 'الآن', read: false }, ...prev]);

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = (side: ChatSide) =>
    setNotifications((prev) => prev.map((n) => (n.side === side ? { ...n, read: true } : n)));

  return (
    <NotificationsContext.Provider value={{ notifications, notify, markRead, markAllRead, pendingTab, setPendingTab }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
};