import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import MessagingSettingsCard from '../../components/chat/MessagingSettingsCard';
import { Building2, Users2, Link2, Plus, Shield, Check, X } from 'lucide-react';

export const BrandSettingsView: React.FC = () => {
  const { brandProfile, showToast } = useApp();
  const [tab, setTab] = useState<'org' | 'team' | 'integrations'>('org');

  const [name, setName] = useState(brandProfile.name);
  const [website, setWebsite] = useState(brandProfile.website);
  const [phone, setPhone] = useState(brandProfile.phone);
  const [industry, setIndustry] = useState(brandProfile.industry);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'supervisor' | 'viewer'>('manager');

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم حفظ بيانات المنظمة بنجاح');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviteModalOpen(false);
    showToast(`تم إرسال دعوة الانضمام إلى ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      <div className="border-b border-white/[0.08] pb-5">
        <h1 className="text-2xl font-bold text-white font-heading">إعدادات المنظمة والحساب</h1>
        <p className="text-xs text-[#A3A3A3] mt-1">إدارة معلومات البراند، صلاحيات الفريق، والربط مع المتاجر الإلكترونية</p>
      </div>

      {/* Tabs Row: المنظمة / الفريق / الربط */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit">
        {[
          { id: 'org', label: 'المنظمة والبراند' },
          { id: 'team', label: 'فريق العمل والصلاحيات' },
          { id: 'integrations', label: 'الربط والتكامل' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: المنظمة */}
      {tab === 'org' && (
        <form onSubmit={handleSaveOrg} className="max-w-2xl rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-6 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <img src={brandProfile.logo} alt="" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20" />
            <button
              type="button"
              onClick={() => showToast('يمكنك اختيار شعار المنظمة')}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.08] text-xs text-white"
            >
              تغيير الشعار
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">اسم البراند / المنظمة</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">الموقع الإلكتروني</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white font-mono"
                dir="ltr"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">رقم الهاتف (+966)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white font-mono"
                dir="ltr"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">مجال النشاط</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="self-start py-2.5 px-6 rounded-full bg-white text-black font-bold text-xs shadow-md mt-2"
          >
            حفظ معلومات المنظمة
          </button>
        </form>
      )}
      {/* الرسائل */}
      {tab === 'org' && (
        <div className="max-w-2xl">
          <MessagingSettingsCard />
        </div>
      )}
      {/* Tab 2: الفريق */}
      {tab === 'team' && (
        <div className="max-w-3xl rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-base font-bold text-white font-heading">أعضاء الفريق والصلاحيات</h2>
              <p className="text-xs text-[#A3A3A3]">يمكن للمدراء مراجعة المقاطع واعتماد الأرباح</p>
            </div>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="py-2 px-4 rounded-full bg-white text-black font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>دعوة عضو</span>
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {brandProfile.teamMembers.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center font-bold text-white">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{m.name}</span>
                    <span className="text-[10px] text-white/50 font-mono">{m.email}</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-white/80 font-medium text-[11px]">
                  {m.role === 'owner' ? 'المالك الأساسي' : m.role === 'manager' ? 'مدير حملات' : 'مشرف تدقيق'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: الربط (Shopify، Meta Ads، TikTok Ads، سلة، زد — "قريباً") */}
      {tab === 'integrations' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'منصة سلة Salla', desc: 'تتبع المبيعات وأكواد الخصم آلياً' },
            { name: 'منصة زد Zid', desc: 'ربط سلة المشتريات ومبيعات الكليبرز' },
            { name: 'Shopify', desc: 'مزامنة طلبات المتجر العالمي' },
            { name: 'Meta Ads Manager', desc: 'استخدام أفضل مقاطع الـ UGC كإعلانات ممولة' },
            { name: 'TikTok Ads Center', desc: 'إطلاق إعلانات Spark Ads بموافقة الصانع' },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-[24px] bg-white/[0.04] border border-white/[0.1] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white font-heading">{item.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-white/60 text-[10px] font-bold">
                    قريباً
                  </span>
                </div>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => showToast(`سيتم إتاحة الربط مع ${item.name} في التحديث القادم`)}
                className="w-full py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs text-white/60 font-medium transition-colors text-center"
              >
                تفعيل الإشعار عند الإطلاق
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
          <div className="relative w-full max-w-md rounded-[28px] bg-[#121212] border border-white/[0.18] p-7 text-right shadow-2xl">
            <h2 className="text-lg font-bold text-white font-heading">دعوة عضو جديد لفريق الحملات</h2>
            <form onSubmit={handleSendInvite} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/80">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.sa"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white font-mono"
                  dir="ltr"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/80">الدور والصلاحيات</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full h-11 px-4 rounded-xl bg-[#141414] border border-white/[0.14] text-xs text-white"
                >
                  <option value="manager">مدير حملات (إطلاق وتعديل الميزانية)</option>
                  <option value="supervisor">مشرف تدقيق (قبول ورفض المقاطع فقط)</option>
                  <option value="viewer">مشاهد (قراءة التحليلات فقط)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button type="submit" className="flex-1 py-3 rounded-full bg-white text-black font-bold text-xs shadow-md">
                  إرسال الدعوة
                </button>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-5 py-3 rounded-full bg-white/[0.06] text-white text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandSettingsView;
