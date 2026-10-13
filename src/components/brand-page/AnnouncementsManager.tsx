import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCommunity } from '../../context/CommunityContext';
import { ImagePlus, X, Pin, PinOff, Trash2, Heart, Link2, Send } from 'lucide-react';

const MAX_IMAGES = 4;

// إدارة الإعلانات من جهة البراند: إعلان جديد + قائمة المنشورات
export const AnnouncementsManager: React.FC<{ brandName: string }> = ({ brandName }) => {
  const { campaigns, showToast } = useApp();
  const { posts, addPost, deletePost, togglePin } = useCommunity();

  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [campaignId, setCampaignId] = useState('');
  const [pinned, setPinned] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const myCampaigns = campaigns.filter((c) => c.brandName === brandName);
  const myPosts = posts
    .filter((p) => p.brandName === brandName)
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  // الصور تنقرا من جهاز المستخدم وتنعرض مباشرة (بدون سيرفر)
  const onPickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - images.length);
    setImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addPost({
      brandName,
      text: text.trim(),
      images: images.length ? images : undefined,
      campaignId: campaignId || undefined,
      isPinned: pinned,
    });
    setText('');
    setImages([]);
    setCampaignId('');
    setPinned(false);
    showToast('تم نشر الإعلان لأعضاء المجتمع');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* إعلان جديد */}
      <form onSubmit={publish} className="p-5 rounded-[22px] bg-white/[0.05] border border-white/[0.14] flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white font-heading">إعلان جديد</h3>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="اكتب إعلانك لأعضاء المجتمع..."
          className="w-full resize-none rounded-xl bg-white/[0.04] border border-white/[0.1] p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40"
        />

        {/* الصور المختارة */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((src) => (
              <div key={src} className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.1]">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((x) => x !== src))}
                  className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                  aria-label="إزالة الصورة"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPickImages} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={images.length >= MAX_IMAGES}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs text-white hover:bg-white/[0.12] transition-colors disabled:opacity-40"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            صور ({images.length}/{MAX_IMAGES})
          </button>

          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="h-9 px-3 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs text-white focus:outline-none max-w-[260px]"
          >
            <option value="" className="bg-surface">بدون ربط بحملة</option>
            {myCampaigns.map((c) => (
              <option key={c.id} value={c.id} className="bg-surface">
                {c.title}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs text-white cursor-pointer select-none">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-white" />
            تثبيت فوق
          </label>

          <button
            type="submit"
            disabled={!text.trim()}
            className="white-glow-button mr-auto px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Send className="w-3.5 h-3.5" />
            نشر
          </button>
        </div>
        <p className="text-[11px] text-white/40">الإعلانات للتذكير والتوضيح. شروط الحملة ما تتغير بعد إطلاقها.</p>
      </form>

      {/* المنشورات */}
      <div className="flex flex-col gap-3">
        {myPosts.length === 0 && (
          <div className="glass-panel rounded-[22px] py-12 text-center text-sm text-white/60">ما نشرت أي إعلان للحين</div>
        )}
        {myPosts.map((post) => {
          const linked = post.campaignId ? myCampaigns.find((c) => c.id === post.campaignId) : undefined;
          return (
            <div key={post.id} className="p-4 rounded-[20px] bg-white/[0.04] border border-white/[0.1] flex gap-4">
              {post.images?.[0] && (
                <img src={post.images[0]} alt="" referrerPolicy="no-referrer" className="w-20 h-20 rounded-xl object-cover shrink-0 bg-neutral-900" />
              )}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[11px] text-white/50">
                  {post.isPinned && (
                    <span className="inline-flex items-center gap-1 text-white/80">
                      <Pin className="w-3 h-3" /> مثبّت ·
                    </span>
                  )}
                  <span>{post.createdAt}</span>
                  <span className="inline-flex items-center gap-1">
                    · <Heart className="w-3 h-3" /> {post.likes}
                  </span>
                </div>
                <p className="text-sm text-white/85 leading-relaxed line-clamp-2">{post.text}</p>
                {linked && (
                  <span className="flex items-center gap-1 text-[11px] text-white/50 truncate">
                    <Link2 className="w-3 h-3 shrink-0" /> {linked.title}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => togglePin(post.id)}
                  title={post.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
                  className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.12] text-white/80 hover:bg-white/[0.12] flex items-center justify-center"
                >
                  {post.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deletePost(post.id);
                    showToast('تم حذف الإعلان');
                  }}
                  title="حذف"
                  className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.12] text-rose-300 hover:bg-rose-500/10 flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnnouncementsManager;