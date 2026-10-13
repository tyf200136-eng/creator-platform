import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { useCommunity } from '../../context/CommunityContext';
import { useChat } from '../../context/ChatContext';
import { useNotifications } from '../../context/NotificationsContext';
import { MY_BRAND_NAME } from '../../data/communityData';
import { SocialPlatform } from '../../types';
import PlatformIcon from '../../components/PlatformIcon';
import StatusBadge from '../../components/common/StatusBadge';
import FieldError from '../../components/common/FieldError';
import { urlError, platformUrlError } from '../../utils/validators';
import AnnouncementsManager from '../../components/brand-page/AnnouncementsManager';
import QuestionsManager from '../../components/brand-page/QuestionsManager';
import BrandProfileView from '../creator/BrandProfileView';
import { Eye, X, ImagePlus, Globe, Save, Users, Search, MessageCircle } from 'lucide-react';

type Tab = 'page' | 'announcements' | 'questions' | 'members';

const PLATFORMS: { id: SocialPlatform; label: string }[] = [
  { id: 'tiktok', label: 'تيك توك' },
  { id: 'instagram', label: 'إنستقرام' },
  { id: 'snapchat', label: 'سناب' },
  { id: 'x', label: 'إكس' },
  { id: 'youtube', label: 'يوتيوب' },
];

const BIO_MAX = 200;

const inputClass =
  'w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.12] text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40';

// ---------- تبويب "الصفحة": الغلاف والنبذة والروابط ----------
const PageEditor: React.FC<{ brandName: string }> = ({ brandName }) => {
  const { campaigns, showToast } = useApp();
  const { getBrandPage, updateBrandPage } = useCommunity();
  const page = getBrandPage(brandName);
  const first = campaigns.find((c) => c.brandName === brandName);

  const [cover, setCover] = useState(page?.cover || first?.coverImage || '');
  const [bio, setBio] = useState(page?.bio ?? '');
  const [industry, setIndustry] = useState(page?.industry || first?.category || '');
  const [website, setWebsite] = useState(page?.website ?? '');
  const [socials, setSocials] = useState<Record<string, string>>(
    Object.fromEntries((page?.socials ?? []).map((s) => [s.platform, s.url]))
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCover(URL.createObjectURL(file));
    e.target.value = '';
  };

  const [showErrors, setShowErrors] = useState(false);

  // ===================== حالات الخطأ =====================
  // كل رابط لازم يكون https، ورابط كل منصة لازم يكون من نفس المنصة
  const linkErrors: Record<string, string | undefined> = {
    website: urlError(website),
    ...Object.fromEntries(PLATFORMS.map((p) => [p.id, platformUrlError(socials[p.id] ?? '', p.id, false)])),
  };
  const lErr = (k: string) => (showErrors ? linkErrors[k] : undefined);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(linkErrors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    updateBrandPage(brandName, {
      cover,
      bio: bio.trim(),
      industry: industry.trim(),
      website: website.trim() || undefined,
      socials: PLATFORMS.filter((p) => socials[p.id]?.trim()).map((p) => ({
        platform: p.id,
        url: socials[p.id].trim(),
      })),
    });
    showToast('تم حفظ صفحة العلامة التجارية');
  };

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-6">
      {/* الغلاف */}
      <section className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-white/80">صورة الغلاف</span>
        <div className="relative h-[200px] rounded-[22px] overflow-hidden border border-white/[0.12] bg-neutral-900">
          {cover && <img src={cover} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickCover} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-4 left-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-xs font-semibold text-white hover:bg-black/80 transition-colors"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            تغيير الغلاف
          </button>
        </div>
        <span className="text-[11px] text-white/40">المقاس المقترح 1600×500. يظهر بالأبيض والأسود ويتلون عند المرور.</span>
      </section>

      {/* النبذة والمجال */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="md:col-span-2 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-white/80">النبذة</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            rows={3}
            placeholder="عرّف صناع المحتوى بعلامتك ووش تدور عليه في التعاون"
            className="w-full resize-none rounded-xl bg-white/[0.04] border border-white/[0.12] p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40"
          />
          <span className="text-[11px] text-white/40 font-mono self-end">{bio.length}/{BIO_MAX}</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-white/80">المجال</span>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass} />
        </label>
      </section>

      {/* الروابط */}
      <section className="flex flex-col gap-3">
        <span className="text-xs font-semibold text-white/80">الروابط</span>
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white/70 shrink-0">
              <Globe className="w-4 h-4" />
            </span>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              dir="ltr"
              className={`${inputClass} ${lErr('website') ? 'border-red-500/60!' : ''}`}
            />
          </label>
          <div className="pr-11"><FieldError message={lErr('website')} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLATFORMS.map((p) => (
            <div key={p.id} className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <span
                title={p.label}
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white/80 shrink-0"
              >
                <PlatformIcon platform={p.id} size={14} />
              </span>
              <input
                value={socials[p.id] ?? ''}
                onChange={(e) => setSocials((prev) => ({ ...prev, [p.id]: e.target.value }))}
                placeholder={`رابط حسابك في ${p.label}`}
                dir="ltr"
                className={`${inputClass} ${lErr(p.id) ? 'border-red-500/60!' : ''}`}
              />
            </label>
            <div className="pr-11"><FieldError message={lErr(p.id)} /></div>
            </div>
          ))}
        </div>
      </section>

      <button type="submit" className="white-glow-button self-start px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5">
        <Save className="w-3.5 h-3.5" />
        حفظ التغييرات
      </button>
    </form>
  );
};

// ---------- تبويب "الأعضاء" ----------
const MembersList: React.FC<{ brandName: string }> = ({ brandName }) => {
  const { membersOf, memberCount } = useCommunity();
  const { openChatAsBrand } = useChat();
  const [q, setQ] = useState('');
  const members = membersOf(brandName).filter(
    (m) => !q.trim() || m.name.includes(q.trim()) || m.handle.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <Users className="w-4 h-4 text-white/60" />
          <span className="font-mono font-bold">{memberCount(brandName).toLocaleString()}</span>
          <span className="text-xs text-white/60">عضو</span>
        </div>
        <div className="relative w-full max-w-xs">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم أو المعرّف"
            className="w-full h-10 pr-9 pl-4 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-white/30 focus:outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        </div>
      </div>

      <div className="rounded-[22px] border border-white/[0.1] divide-y divide-white/[0.06] overflow-hidden">
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <img src={m.avatar} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">{m.name}</span>
                <span className="text-[11px] text-white/50 font-mono">{m.handle}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {m.isParticipant && <StatusBadge tone="success">مشارك في حملة</StatusBadge>}
              <span className="text-[11px] text-white/40">انضم {m.joinedAt}</span>
              <button
                type="button"
                title="مراسلة"
                onClick={() => openChatAsBrand({ creatorId: m.id, creatorName: m.name, creatorAvatar: m.avatar })}
                className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.12] text-white/70 hover:text-white hover:bg-white/[0.12] flex items-center justify-center"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && <div className="py-10 text-center text-sm text-white/60">ما فيه نتائج</div>}
      </div>
      <p className="text-[11px] text-white/40">تعرض القائمة عيّنة من الأعضاء.</p>
    </div>
  );
};

// ---------- الصفحة الرئيسية ----------
export const BrandPageView: React.FC = () => {
  const { questions } = useCommunity();
  const [tab, setTab] = useState<Tab>('page');
  const [previewOpen, setPreviewOpen] = useState(false);
  const { pendingTab, setPendingTab } = useNotifications();

  // فتح التبويب المطلوب لما يجي المستخدم من إشعار
  useEffect(() => {
    if (pendingTab === 'questions' || pendingTab === 'members' || pendingTab === 'announcements') {
      setTab(pendingTab);
      setPendingTab(null);
    }
  }, [pendingTab]);
  const brandName = MY_BRAND_NAME;

  const pendingCount = questions.filter((q) => q.brandName === brandName && !q.answer).length;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'page', label: 'الصفحة' },
    { id: 'announcements', label: 'الإعلانات' },
    { id: 'questions', label: 'الأسئلة' },
    { id: 'members', label: 'الأعضاء' },
  ];

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1100px] mx-auto text-right">
      {/* الهيدر */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">ملف العلامة التجارية</h1>
          <p className="text-xs text-[#A3A3A3] mt-1">صفحتك العامة ومجتمعك، اللي يشوفها صناع المحتوى</p>
        </div>
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="py-2.5 px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2 w-fit"
        >
          <Eye className="w-4 h-4" />
          معاينة كما يراها صناع المحتوى
        </button>
      </div>

      {/* التبويبات */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            {t.label}
            {t.id === 'questions' && pendingCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'page' && <PageEditor brandName={brandName} />}
      {tab === 'announcements' && <AnnouncementsManager brandName={brandName} />}
      {tab === 'questions' && <QuestionsManager brandName={brandName} />}
      {tab === 'members' && <MembersList brandName={brandName} />}

      {/* المعاينة: تنعرض على مستوى الصفحة كاملة (Portal) عشان تغطي القائمة الجانبية */}
      {previewOpen && createPortal(
        <div dir="rtl" className="fixed inset-0 z-[45] bg-[#0A0A0A] text-white overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-3 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Eye className="w-4 h-4" />
              معاينة: هكذا يشوف صناع المحتوى صفحتك
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold"
            >
              <X className="w-3.5 h-3.5" />
              إغلاق المعاينة
            </button>
          </div>
          <BrandProfileView brandName={brandName} preview />
        </div>,
        document.body
      )}
    </div>
  );
};

export default BrandPageView;