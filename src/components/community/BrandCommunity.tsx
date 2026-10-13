import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCommunity } from '../../context/CommunityContext';
import { useNotifications } from '../../context/NotificationsContext';
import { CommunityPost, CommunityQuestion } from '../../types';
import StatusBadge from '../common/StatusBadge';
import { Megaphone, Pin, Heart, Users, Check, UserPlus, Send, Lock, Link2 } from 'lucide-react';

interface BrandCommunityProps {
  brandName: string;
  brandAvatar: string;
}

type Section = 'announcements' | 'qa';

// ---------- كرت الإعلان ----------
const PostCard: React.FC<{ post: CommunityPost; brandName: string; brandAvatar: string }> = ({
  post,
  brandName,
  brandAvatar,
}) => {
  const { campaigns, navigateToCampaignDetail } = useApp();
  const { isLiked, toggleLike } = useCommunity();
  const linkedCampaign = post.campaignId ? campaigns.find((c) => c.id === post.campaignId) : undefined;
  const liked = isLiked(post.id);

  return (
    <article
      className={`p-5 rounded-[22px] bg-white/[0.04] border flex flex-col gap-4 ${
        post.isPinned ? 'border-white/[0.22]' : 'border-white/[0.1]'
      }`}
    >
      {/* رأس المنشور */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={brandAvatar} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">{brandName}</span>
            <span className="text-[11px] text-white/50">{post.createdAt}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {post.isPinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.13] text-[10px] font-semibold text-white/80">
              <Pin className="w-3 h-3" />
              مثبّت
            </span>
          )}
        </div>
      </div>

      {/* النص */}
      <p className="text-sm text-white/85 leading-relaxed whitespace-pre-line">{post.text}</p>

      {/* الصور */}
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full aspect-[16/10] object-cover rounded-xl border border-white/[0.08] bg-neutral-900"
            />
          ))}
        </div>
      )}

      {/* أسفل المنشور: الحملة المرتبطة + الإعجاب */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
        {linkedCampaign ? (
          <button
            type="button"
            onClick={() => navigateToCampaignDetail(linkedCampaign)}
            className="flex items-center gap-1.5 min-w-0 text-xs text-white/70 hover:text-white transition-colors"
          >
            <Link2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{linkedCampaign.title}</span>
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={() => toggleLike(post.id)}
          aria-pressed={liked}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 ${
            liked
              ? 'bg-white text-black border-white shadow-[0_0_14px_rgba(255,255,255,0.35)]'
              : 'bg-white/[0.05] border-white/[0.12] text-white/80 hover:bg-white/[0.1]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-black' : ''}`} />
          <span className="font-mono tabular-nums">{post.likes + (liked ? 1 : 0)}</span>
        </button>
      </div>
    </article>
  );
};

// ---------- كرت السؤال ----------
const QuestionCard: React.FC<{ q: CommunityQuestion; brandName: string; brandAvatar: string }> = ({
  q,
  brandName,
  brandAvatar,
}) => (
  <article className="p-5 rounded-[22px] bg-white/[0.04] border border-white/[0.1] flex flex-col gap-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={q.authorAvatar} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-white truncate">{q.authorName}</span>
          <span className="text-[11px] text-white/50">{q.createdAt}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {q.isFaq && <StatusBadge tone="neutral">سؤال شائع</StatusBadge>}
        {!q.answer && <StatusBadge tone="warning">بانتظار رد البراند</StatusBadge>}
      </div>
    </div>

    <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>

    {q.answer && (
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1]">
        <img src={brandAvatar} alt="" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full object-cover shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold text-white/70">رد {brandName}</span>
          <p className="text-xs text-white/85 leading-relaxed">{q.answer}</p>
        </div>
      </div>
    )}
  </article>
);

// ---------- المجتمع ----------
export const BrandCommunity: React.FC<BrandCommunityProps> = ({ brandName, brandAvatar }) => {
  const { posts, isMember, toggleMembership, memberCount, canAsk, askQuestion, visibleQuestions } = useCommunity();
  const [section, setSection] = useState<Section>('announcements');
  const [draft, setDraft] = useState('');
  const { pendingTab, setPendingTab } = useNotifications();

  // جاي من إشعار "رد على سؤالك" ← افتح الأسئلة
  useEffect(() => {
    if (pendingTab === 'community-qa') {
      setSection('qa');
      setPendingTab(null);
    }
  }, [pendingTab]);

  const brandPosts = posts
    .filter((p) => p.brandName === brandName)
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  const brandQuestions = visibleQuestions(brandName).sort((a, b) => Number(b.isFaq) - Number(a.isFaq));
  const member = isMember(brandName);
  const allowedToAsk = canAsk(brandName);

  const submitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    askQuestion(brandName, draft.trim());
    setDraft('');
  };

  const pill = (active: boolean) =>
    `flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
      active ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
    }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* العمود الرئيسي */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit">
          <button type="button" onClick={() => setSection('announcements')} className={pill(section === 'announcements')}>
            <Megaphone className="w-3.5 h-3.5" />
            الإعلانات ({brandPosts.length})
          </button>
          <button type="button" onClick={() => setSection('qa')} className={pill(section === 'qa')}>
            الأسئلة والأجوبة ({brandQuestions.length})
          </button>
        </div>

        {section === 'announcements' ? (
          brandPosts.length > 0 ? (
            brandPosts.map((post) => (
              <PostCard key={post.id} post={post} brandName={brandName} brandAvatar={brandAvatar} />
            ))
          ) : (
            <div className="glass-panel rounded-[22px] py-14 text-center text-sm text-white/60">
              ما فيه إعلانات للحين
            </div>
          )
        ) : (
          <>
            {/* صندوق السؤال */}
            {allowedToAsk ? (
              <form onSubmit={submitQuestion} className="p-4 rounded-[22px] bg-white/[0.05] border border-white/[0.14] flex flex-col gap-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  placeholder={`اسأل ${brandName}، وبيكون الرد قدام الكل`}
                  className="w-full resize-none rounded-xl bg-white/[0.04] border border-white/[0.1] p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-white/50">سؤالك يظهر للجميع بعد رد البراند</span>
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="white-glow-button px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Send className="w-3.5 h-3.5" />
                    أرسل السؤال
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-[22px] bg-white/[0.03] border border-white/[0.1] flex items-center gap-3 text-xs text-white/70">
                <Lock className="w-4 h-4 text-white/50 shrink-0" />
                <span>الأسئلة متاحة للمشاركين في حملات {brandName}. انضم لحملة عشان تقدر تسأل.</span>
              </div>
            )}

            {brandQuestions.length > 0 ? (
              brandQuestions.map((q) => (
                <QuestionCard key={q.id} q={q} brandName={brandName} brandAvatar={brandAvatar} />
              ))
            ) : (
              <div className="glass-panel rounded-[22px] py-14 text-center text-sm text-white/60">
                ما فيه أسئلة للحين
              </div>
            )}
          </>
        )}
      </div>

      {/* العمود الجانبي: العضوية */}
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-24 p-5 rounded-[22px] bg-white/[0.05] border border-white/[0.14] flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-4 h-4 text-white/60" />
            <span className="font-mono font-bold text-lg">{memberCount(brandName).toLocaleString()}</span>
            <span className="text-xs text-white/60">عضو في المجتمع</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            انضم للمجتمع عشان يوصلك كل إعلان جديد من {brandName} أول بأول.
          </p>
          <button
            type="button"
            onClick={() => toggleMembership(brandName)}
            className={
              member
                ? 'w-full py-2.5 rounded-full bg-white/[0.08] border border-white/[0.16] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/[0.14] transition-all'
                : 'white-glow-button w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5'
            }
          >
            {member ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            {member ? 'عضو في المجتمع' : 'انضم للمجتمع'}
          </button>
          <p className="text-[11px] text-white/40 leading-relaxed">
            التفاعل على الإعلانات بالإعجاب فقط، والأسئلة للمشاركين في الحملات.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default BrandCommunity;