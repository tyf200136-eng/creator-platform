import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationsContext';
import AvatarUpload from '../../components/common/AvatarUpload';
import FieldError, { fieldBorder } from '../../components/common/FieldError';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Video,
  Eye,
  ShieldCheck
} from 'lucide-react';

export const CreatorOnboardingView: React.FC = () => {
  const { isCreatorOnboardingOpen, setIsCreatorOnboardingOpen, setCreatorView, showToast, setCreatorProfile } = useApp();
  const { notify } = useNotifications();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form states
  // كل شي يبدأ فاضي، وصانع المحتوى يعبّيه بنفسه
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [cameraComfort, setCameraComfort] = useState<'' | 'yes' | 'faceless' | 'sometimes' | 'unsure'>('');
  const [experienceLevel, setExperienceLevel] = useState<'' | 'beginner' | 'occasional' | 'regular' | 'fulltime'>('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  if (!isCreatorOnboardingOpen) return null;

  const interestsList = [
    'عطور فاخرة',
    'مقاهي ومشروبات',
    'تطبيقات وتوصيل',
    'ألعاب ورياضات إلكترونية',
    'أزياء وأناقة',
    'بودكاست وإعلام',
    'تقنية وأجهزة',
    'مطاعم وأكل',
  ];

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(prev => prev.filter(i => i !== item));
    } else {
      if (selectedInterests.length < 3) {
        setSelectedInterests(prev => [...prev, item]);
      } else {
        showToast('يمكنك اختيار حتى 3 اهتمامات كحد أقصى');
      }
    }
  };

  // ===================== حالات الخطأ =====================
  const stepErrors = (() => {
    const e: Record<string, string | undefined> = {};
    if (step === 1) {
      if (!avatar) e.avatar = 'ارفع صورة شخصية، البراندات تشوفها لما تقدّم على حملاتهم';
      const n = name.trim();
      if (!n) e.name = 'اكتب اسمك أو لقبك';
      else if (n.length < 2) e.name = 'الاسم قصير، حرفين على الأقل';
      else if (n.length > 30) e.name = 'الاسم طويل، 30 حرف كحد أقصى';
    }
    if (step === 3 && selectedInterests.length === 0) e.interests = 'اختر مجال واحد على الأقل';
    if (step === 4 && !cameraComfort) e.camera = 'اختر الخيار الأقرب لك';
    if (step === 5 && !experienceLevel) e.experience = 'اختر مستواك';
    if (step === 6 && !agreedTerms) e.terms = 'لازم توافق على الشروط عشان تكمل';
    return e;
  })();
  const err = (k: string) => (showErrors ? stepErrors[k] : undefined);

  const finish = () => {
    setCreatorProfile((prev) => ({ ...prev, name: name.trim(), avatar }));
    setIsCreatorOnboardingOpen(false);
    setCreatorView('discover');
    showToast('أهلاً فيك! حسابك جاهز');
    notify({
      side: 'creator',
      kind: 'system',
      title: 'كمّل ملفك الشخصي',
      body: 'أضف نبذتك ومدينتك وبريدك الإلكتروني، عشان تزيد فرص قبولك في الحملات.',
      target: { type: 'settings' },
    });
  };

  const handleNext = () => {
    if (Object.values(stepErrors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step < totalSteps) setStep(s => s + 1);
    else finish();
  };

  const handlePrev = () => {
    setShowErrors(false);
    if (step > 1) setStep(s => s - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-[32px] bg-[#0E0E0E] border border-white/[0.18] p-8 text-right shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
        {/* Close */}
        <button
          onClick={() => setIsCreatorOnboardingOpen(false)}
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Progress Bar */}
        <div className="flex flex-col gap-2 mb-8 ml-12">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>الخطوة {step} من {totalSteps}</span>
            <span>إعداد حساب صانع المحتوى</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Profile (Photo & Name) */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">بيانات ملفك الشخصي</h2>
              <p className="text-xs text-[#A3A3A3] mt-1">اختر اسمك وصورتك كما سيظهران لأصحاب الحملات</p>
            </div>

            <AvatarUpload
              value={avatar}
              onChange={setAvatar}
              label="صورتك الشخصية"
              hint="JPG أو PNG أو WEBP · حتى 5 ميقابايت"
              error={err('avatar')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">اسمك أو لقبك الإبداعي</label>
              <input
                type="text"
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: نورة الدوسري"
                className={`w-full h-12 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('name'))} text-sm text-white`}
                required
              />
              <FieldError message={err('name')} />
            </div>
          </div>
        )}

        {/* Step 2: "كيف تربح" Explainer */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">كيف تربح من المنصة؟</h2>
              <p className="text-xs text-[#A3A3A3] mt-1">4 طرق معتمدة لإنتاج المحتوى وكسب المكافآت</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex flex-col gap-1">
                <span className="text-xs font-bold text-white">1. Clipping (قص اللقطات)</span>
                <p className="text-[11px] text-[#A3A3A3]">قص أفضل لحظات البثوث والبودكاست وإضافة ترجمات ديناميكية.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex flex-col gap-1">
                <span className="text-xs font-bold text-white">2. UGC (محتوى عفوي)</span>
                <p className="text-[11px] text-[#A3A3A3]">تصوير ومراجعة المنتجات بأسلوب عفوي وشخصي يعزز المصداقية.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex flex-col gap-1">
                <span className="text-xs font-bold text-white">3. سناب وترند تيك توك</span>
                <p className="text-[11px] text-[#A3A3A3]">استخدام الأصوات الرائجة وتحديات السوشيال ميديا لجلب ملايين المشاهدات.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex flex-col gap-1">
                <span className="text-xs font-bold text-white">4. شعار وأكواد الخصم</span>
                <p className="text-[11px] text-[#A3A3A3]">إبراز علامة البراند أو كود التخفيض لكسب مكافآت إضافية.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Interests chips (pick up to 3) */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">وش تصنيفات المحتوى اللي تهمك؟</h2>
              <p className="text-xs text-[#A3A3A3] mt-1">اختر حتى 3 مجالات لعرض الحملات الأنسب لحسابك ({selectedInterests.length}/3)</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {interestsList.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`py-2 px-4 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                        : 'bg-white/[0.04] text-white/70 border-white/[0.1] hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <FieldError message={err('interests')} />
          </div>
        )}

        {/* Step 4: "مرتاح قدام الكاميرا؟" */}
        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">مرتاح في الظهور أمام الكاميرا؟</h2>
              <p className="text-xs text-[#A3A3A3] mt-1">لا تقلق، لدينا مئات الحملات التي لا تتطلب ظهور الوجه إطلاقاً</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'yes', label: 'نعم، أظهر بوجهي دائماً', desc: 'مناسب لـ UGC ومراجعات المنتجات' },
                { id: 'faceless', label: 'بدون وجه (Faceless)', desc: 'كليبنغ، مونتاج، تصوير أيادي أو منتج فقط' },
                { id: 'sometimes', label: 'أحياناً حسب طبيعة الحملة', desc: 'مرن بين الخيارين' },
                { id: 'unsure', label: 'مو متأكد حالياً', desc: 'سأستكشف الخيارات أولاً' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setCameraComfort(opt.id as any)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    cameraComfort === opt.id
                      ? 'bg-white/[0.12] border-white text-white shadow-[0_0_16px_rgba(255,255,255,0.08)]'
                      : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-xs font-bold text-white block mb-1">{opt.label}</span>
                  <span className="text-[11px] text-[#A3A3A3]">{opt.desc}</span>
                </div>
              ))}
            </div>
            <FieldError message={err('camera')} />
          </div>
        )}

        {/* Step 5: Experience Level */}
        {step === 5 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">ما هو مستواك وتفرغك للمحتوى؟</h2>
              <p className="text-xs text-[#A3A3A3] mt-1">يساعدنا في ترشيح الحملات والعقود الشهرية المناسبة</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'beginner', label: 'مبتدئ أتعلم', desc: 'أول تجربة لي في صناعة المقاطع القصيرة' },
                { id: 'occasional', label: 'أحياناً (هواية)', desc: 'أنشر مقطع أو اثنين أسبوعياً' },
                { id: 'regular', label: 'منتظم (صانع نشط)', desc: 'أنشر شبه يومي وعندي جمهور متفاعل' },
                { id: 'fulltime', label: 'متفرغ تماماً', desc: 'صناعة المحتوى هي عملي ودخلي الأساسي' },
              ].map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setExperienceLevel(lvl.id as any)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    experienceLevel === lvl.id
                      ? 'bg-white/[0.12] border-white text-white shadow-[0_0_16px_rgba(255,255,255,0.08)]'
                      : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-xs font-bold text-white block mb-1">{lvl.label}</span>
                  <span className="text-[11px] text-[#A3A3A3]">{lvl.desc}</span>
                </div>
              ))}
            </div>
            <FieldError message={err('experience')} />
          </div>
        )}

        {/* Step 6: Terms & Agreement */}
        {step === 6 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">الشروط وميثاق الصانع</h2>
              <p className="text-xs text-[#A3A3A3] mt-1">نظام دفع شفاف مبني على المشاهدات الحقيقية</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2.5 text-xs text-white/80 leading-relaxed">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تمنع المنصة استخدام الروبوتات أو برامج تضخيم المشاهدات المزيفة قطعياً.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تحتسب الأرباح وفق تسعيرة الـ CPM المحددة لكل 1,000 مشاهدة مؤكدة.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تقدر تسحب أرباحك متى ما وصل رصيدك 100 ريال، ورسوم السحب 10٪.</span>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-white focus:ring-0"
              />
              <span className="text-xs text-white font-medium">أوافق على الشروط والأحكام وميثاق صناع المحتوى</span>
            </label>
            <FieldError message={err('terms')} />
          </div>
        )}

        {/* Footer Buttons */}
        <div className="mt-8 pt-5 border-t border-white/[0.08] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-white transition-colors"
            >
              رجوع
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-7 py-2.5 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:shadow-[0_0_28px_rgba(255,255,255,0.65)] hover:bg-neutral-100 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <span>{step === totalSteps ? 'إكمال والدخول لاكتشف' : 'متابعة'}</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorOnboardingView;