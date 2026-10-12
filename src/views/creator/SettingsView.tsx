import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PlatformIcon from '../../components/PlatformIcon';
import StatusBadge from '../../components/common/StatusBadge';
import { User, Phone, Mail, MapPin, Globe, CheckCircle2, Bell, Shield, Plus } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { creatorProfile, setIsConnectAccountModalOpen, showToast } = useApp();
  const [name, setName] = useState(creatorProfile.name);
  const [bio, setBio] = useState(creatorProfile.bio);
  const [city, setCity] = useState(creatorProfile.city);
  const [email, setEmail] = useState(creatorProfile.email);
  const [discord, setDiscord] = useState(creatorProfile.discordHandle || '');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم حفظ التعديلات بنجاح');
  };

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      <div className="border-b border-white/[0.08] pb-5">
        <h1 className="text-2xl font-bold text-white font-heading">إعدادات الحساب والملف الشخصي</h1>
        <p className="text-xs text-[#A3A3A3] mt-1">تعديل بياناتك، إدارة الحسابات الاجتماعية المربوطة، وتفضيلات الإشعارات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Info Form (8 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-8 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-6 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <img
              src={creatorProfile.avatar}
              alt={name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-white/30"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{name}</span>
              <span className="text-xs text-[#A3A3A3]">{creatorProfile.handle}</span>
              <button
                type="button"
                onClick={() => showToast('يمكنك رفع صورة جديدة من جهازك')}
                className="text-xs text-white underline mt-1 text-right"
              >
                تغيير الصورة
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">الاسم الكامل</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white font-mono"
                dir="ltr"
                required
              />
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/80">النبذة التعريفية (Bio)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white resize-none leading-relaxed"
            />
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
