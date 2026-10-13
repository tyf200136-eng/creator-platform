import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import MessagingSettingsCard from '../../components/chat/MessagingSettingsCard';
import AvatarUpload from '../../components/common/AvatarUpload';
import CategoryTreePicker from '../../components/common/CategoryTreePicker';
import FieldError, { fieldBorder } from '../../components/common/FieldError';
import { urlError, emailError, saudiContactPhoneError, crNumberError, vatNumberError, onlyDigits } from '../../utils/validators';
import { Building2, Users2, Link2, Plus, Shield, Check, X } from 'lucide-react';

export const BrandSettingsView: React.FC = () => {
  const { brandProfile, setBrandProfile, showToast } = useApp();
  const [tab, setTab] = useState<'org' | 'team' | 'integrations'>('org');

  const [name, setName] = useState(brandProfile.name);
  const [website, setWebsite] = useState(brandProfile.website);
  const [phone, setPhone] = useState(brandProfile.phone);
  const [industry, setIndustry] = useState(brandProfile.industry);
  const [logo, setLogo] = useState(brandProfile.logo);
  const [crNumber, setCrNumber] = useState(brandProfile.crNumber ?? '');
  const [vatNumber, setVatNumber] = useState(brandProfile.vatNumber ?? '');
  const [showErrors, setShowErrors] = useState(false);
  const [showInviteError, setShowInviteError] = useState(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'supervisor' | 'viewer'>('manager');

  // ===================== حالات الخطأ =====================
  const errors = {
    name: !name.trim() ? 'اكتب اسم البراند' : name.trim().length < 2 ? 'الاسم قصير' : undefined,
    website: urlError(website),
    phone: saudiContactPhoneError(phone, false),
    industry: !industry ? 'اختر مجال النشاط' : undefined,
    cr: crNumberError(crNumber),
    vat: vatNumberError(vatNumber),
  };
  const err = (k: keyof typeof errors) => (showErrors ? errors[k] : undefined);
  const inviteError = emailError(inviteEmail);

  // ===================== نسبة اكتمال الملف =====================
  const checklist = [
    { label: 'الشعار', done: Boolean(brandProfile.logo) },
    { label: 'المجال', done: Boolean(brandProfile.industry) },
    { label: 'الموقع الإلكتروني', done: Boolean(brandProfile.website?.trim()) },
    { label: 'رقم التواصل', done: Boolean(brandProfile.phone?.trim()) },
    { label: 'السجل التجاري', done: Boolean(brandProfile.crNumber) },
    { label: 'الرقم الضريبي', done: Boolean(brandProfile.vatNumber) },
  ];
  const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setBrandProfile((prev) => ({
      ...prev,
      name: name.trim(),
      logo,
      website: website.trim(),
      phone: phone.trim(),
      industry,
      crNumber: onlyDigits(crNumber) || undefined,
      vatNumber: onlyDigits(vatNumber) || undefined,
    }));
    showToast('تم حفظ بيانات المنظمة');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteError) {
      setShowInviteError(true);
      return;
    }
    setShowInviteError(false);
    setIsInviteModalOpen(false);
    showToast(`تم إرسال دعوة الانضمام إلى ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      <div className="border-b border-white/[0.08] pb-5">
        <h1 className="text-2xl font-bold text-white font-heading">إعدادات المنظمة والحساب</h1>
        <p className="text-xs text-muted mt-1">إدارة معلومات البراند، صلاحيات الفريق، والربط مع المتاجر الإلكترونية</p>
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
        <>
        {completion < 100 && (
          <div className="max-w-2xl rounded-[22px] bg-white/[0.04] border border-white/[0.12] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">اكتمال ملف المنظمة</span>
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
        <form onSubmit={handleSaveOrg} noValidate className="max-w-2xl rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-6 flex flex-col gap-5">
          <AvatarUpload value={logo} onChange={setLogo} shape="rounded" label="شعار المنظمة" hint="يظهر لصناع المحتوى في كل حملاتك" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">اسم البراند / المنظمة</label>
              <input
                type="text"
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('name'))} text-xs text-white`}
              />
              <FieldError message={err('name')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">الموقع الإلكتروني</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
                className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('website'))} text-xs text-white font-mono text-left`}
                dir="ltr"
              />
              <FieldError message={err('website')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">رقم التواصل</label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX أو 011XXXXXXX"
                className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('phone'))} text-xs text-white font-mono text-left`}
                dir="ltr"
              />
              <FieldError message={err('phone')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <CategoryTreePicker value={industry} onChange={setIndustry} label="مجال النشاط" />
              <FieldError message={err('industry')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">رقم السجل التجاري (اختياري)</label>
              <input
                type="text"
                inputMode="numeric"
                value={crNumber}
                onChange={(e) => setCrNumber(onlyDigits(e.target.value).slice(0, 10))}
                placeholder="10 أرقام"
                className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('cr'))} text-xs text-white font-mono text-left`}
                dir="ltr"
              />
              <FieldError message={err('cr')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">الرقم الضريبي (اختياري)</label>
              <input
                type="text"
                inputMode="numeric"
                value={vatNumber}
                onChange={(e) => setVatNumber(onlyDigits(e.target.value).slice(0, 15))}
                placeholder="3XXXXXXXXXXXXX3"
                className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('vat'))} text-xs text-white font-mono text-left`}
                dir="ltr"
              />
              <span className="text-[10px] text-white/45">يطلع في فواتيرك الضريبية</span>
              <FieldError message={err('vat')} />
            </div>
          </div>

          <button
            type="submit"
            className="self-start py-2.5 px-6 rounded-full bg-white text-black font-bold text-xs shadow-md mt-2"
          >
            حفظ معلومات المنظمة
          </button>
        </form>
        </>
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
              <p className="text-xs text-muted">يمكن للمدراء مراجعة المقاطع واعتماد الأرباح</p>
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
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
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
          <div className="relative w-full max-w-md rounded-[28px] bg-surface border border-white/[0.18] p-7 text-right shadow-2xl">
            <h2 className="text-lg font-bold text-white font-heading">دعوة عضو جديد لفريق الحملات</h2>
            <form onSubmit={handleSendInvite} noValidate className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/80">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.sa"
                  className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(showInviteError ? inviteError : undefined)} text-xs text-white font-mono text-left`}
                  dir="ltr"
                />
                <FieldError message={showInviteError ? inviteError : undefined} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/80">الدور والصلاحيات</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full h-11 px-4 rounded-xl bg-surface border border-white/[0.14] text-xs text-white"
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