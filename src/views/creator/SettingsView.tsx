import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PlatformIcon from '../../components/PlatformIcon';
import StatusBadge from '../../components/common/StatusBadge';
import AvatarUpload from '../../components/common/AvatarUpload';
import FieldError, { fieldBorder } from '../../components/common/FieldError';
import { emailError } from '../../utils/validators';

const BIO_MAX = 200;
import { User, Phone, Mail, MapPin, Globe, CheckCircle2, Bell, Shield, Plus } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { creatorProfile, setCreatorProfile, setIsConnectAccountModalOpen, showToast } = useApp();
  const [avatar, setAvatar] = useState(creatorProfile.avatar);
  const [name, setName] = useState(creatorProfile.name);
  const [bio, setBio] = useState(creatorProfile.bio);
  const [city, setCity] = useState(creatorProfile.city);
  const [email, setEmail] = useState(creatorProfile.email);
  const [discord, setDiscord] = useState(creatorProfile.discordHandle || '');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);

  const [showErrors, setShowErrors] = useState(false);

  // ===================== حالات الخطأ =====================
  const errors = {
    name: !name.trim() ? 'اكتب اسمك' : name.trim().length < 2 ? 'الاسم قصير' : undefined,
    email: emailError(email, false),
    bio: bio.length > BIO_MAX ? `النبذة أطول من ${BIO_MAX} حرف` : undefined,
  };
  const err = (k: keyof typeof errors) => (showErrors ? errors[k] : undefined);

  // ===================== نسبة اكتمال الملف =====================
  const checklist = [
    { label: 'الصورة الشخصية', done: Boolean(avatar) },
    { label: 'الاسم', done: Boolean(creatorProfile.name.trim()) },
    { label: 'البريد الإلكتروني', done: Boolean(creatorProfile.email?.trim()) },
    { label: 'المدينة', done: Boolean(creatorProfile.city?.trim()) },
    { label: 'النبذة', done: Boolean(creatorProfile.bio?.trim()) },
    { label: 'حساب سوشال مربوط', done: creatorProfile.linkedAccounts.some((a) => a.connected) },
  ];
  const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setCreatorProfile((prev) => ({
      ...prev,
      avatar,
      name: name.trim(),
      email: email.trim(),
      city: city.trim(),
      bio: bio.trim(),
      discordHandle: discord.trim(),
    }));
    showToast('تم حفظ التعديلات');
  };

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      <div className="border-b border-white/[0.08] pb-5">
        <h1 className="text-2xl font-bold text-white font-heading">إعدادات الحساب والملف الشخصي</h1>
        <p className="text-xs text-muted mt-1">تعديل بياناتك، إدارة الحسابات الاجتماعية المربوطة، وتفضيلات الإشعارات</p>
      </div>

      {completion < 100 && (
        <div className="rounded-[22px] bg-white/[0.04] border border-white/[0.12] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">اكتمال ملفك الشخصي</span>
            <span className="text-sm font-bold font-mono text-white">{completion}٪</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${completion}%` }} />
          </div>
          <div className="flex flex-wrap gap-2">
            {checklist.filter((c) => !c.done).map((c) => (
              <span key={c.label} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-white/70">
                ناقص: {c.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Info Form (8 cols) */}
        <form onSubmit={handleSave} noValidate className="lg:col-span-8 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-6 flex flex-col gap-5">
          <AvatarUpload value={avatar} onChange={setAvatar} label={name || 'صورتك الشخصية'} hint={creatorProfile.handle} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">الاسم الكامل</label>
              <input
                type="text"
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('name'))} text-xs text-white`}
              />
              <FieldError message={err('name')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('email'))} text-xs text-white font-mono text-left`}
                dir="ltr"
              />
              <FieldError message={err('email')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">رقم الجوال</label>
              <input
                type="tel"
                defaultValue={creatorProfile.phone}
                readOnly
                className="w-full h-11 px-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs text-white/60 font-mono"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">المدينة / الدولة</label>
              <input
                type="text"
                maxLength={40}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: الرياض"
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/80">النبذة التعريفية (Bio)</label>
              <span className="text-[11px] text-white/40 font-mono">{bio.length}/{BIO_MAX}</span>
            </div>
            <textarea
              rows={3}
              maxLength={BIO_MAX}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="عرّف البراندات بنفسك ونوع محتواك..."
              className={`w-full p-3 rounded-xl bg-white/[0.05] border ${fieldBorder(err('bio'))} text-xs text-white resize-none leading-relaxed`}
            />
            <FieldError message={err('bio')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/80">معرف الديسكورد (Discord Link)</label>
            <input
              type="text"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white font-mono"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            className="self-start py-2.5 px-7 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_16px_rgba(255,255,255,0.3)] hover:bg-neutral-100 transition-all mt-2"
          >
            حفظ التغييرات
          </button>
        </form>

        {/* Linked Accounts & Notifications (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Linked accounts box */}
          <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-xs font-bold text-white font-heading">الحسابات المربوطة</h2>
              <button
                onClick={() => setIsConnectAccountModalOpen(true)}
                className="text-xs text-white underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>ربط جديد</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {creatorProfile.linkedAccounts.map((acc) => (
                <div
                  key={acc.platform}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <PlatformIcon platform={acc.platform} size={15} />
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-white">{acc.handle}</span>
                      <span className="text-[10px] text-white/50">{acc.followers} متابع</span>
                    </div>
                  </div>

                  {acc.connected ? (
                    <StatusBadge tone="success">مربوط</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">غير مربوط</StatusBadge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notifications preferences */}
          <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-5 flex flex-col gap-3">
            <h2 className="text-xs font-bold text-white font-heading border-b border-white/[0.08] pb-2">
              تنبيهات الأرباح والحملات
            </h2>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs text-white/80">إشعار عند إيداع الأرباح</span>
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-white focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs text-white/80">إشعار عند إطلاق حملة جديدة في تخصصك</span>
              <input
                type="checkbox"
                checked={notifSms}
                onChange={(e) => setNotifSms(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-white focus:ring-0"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;