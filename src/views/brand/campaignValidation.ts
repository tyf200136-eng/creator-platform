import { CampaignType, SocialPlatform } from '../../types';

/** كل القيم اللي نفحصها من نموذج إنشاء الحملة */
export interface CampaignFormValues {
  name: string;
  description: string;
  coverUrl: string;
  category: string;
  startDate: string;
  endDate: string;
  // مقاطع
  videoTypes: string[];
  rules: string[];
  selectedPlatforms: SocialPlatform[];
  videoBudget: number;
  ratePer1k: number;
  access: 'open' | 'application';
  screeningQuestion: string;
  // تصميم
  exactCopy: string;
  designDos: string[];
  selectedSizes: string[];
  selectedFormats: string[];
  customWidth: number;
  customHeight: number;
  carouselSlides: number;
  pricePerDesign: number;
  designsNeeded: number;
}

/** مفتاح الخانة ← رسالة الخطأ */
export type FieldErrors = Partial<Record<string, string>>;

export const MIN_TITLE = 5;
export const MIN_DESCRIPTION = 20;
export const MIN_VIDEO_BUDGET = 1000;
export const MIN_DESIGN_PRICE = 300;

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** الحقول المشتركة: العنوان، الوصف، الصورة، التصنيف، التواريخ */
const validateBasics = (v: CampaignFormValues, e: FieldErrors) => {
  const title = v.name.trim();
  if (!title) e.name = 'اكتب عنوان الحملة';
  else if (title.length < MIN_TITLE) e.name = `العنوان قصير، اكتب ${MIN_TITLE} أحرف على الأقل`;

  const desc = v.description.trim();
  if (!desc) e.description = 'اكتب وصف الحملة';
  else if (desc.length < MIN_DESCRIPTION) e.description = `الوصف قصير، وضّح الفكرة بـ ${MIN_DESCRIPTION} حرف على الأقل`;

  if (!v.coverUrl) e.cover = 'ارفع صورة للحملة';
  if (!v.category) e.category = 'اختر تصنيف الحملة';

  if (!v.startDate || !v.endDate) e.dates = 'حدد تاريخ البداية والنهاية';
  else if (v.startDate < todayISO()) e.dates = 'تاريخ البداية ما يصير يكون قبل اليوم';
  else if (v.endDate <= v.startDate) e.dates = 'تاريخ النهاية لازم يكون بعد تاريخ البداية';
};

/** يرجّع أخطاء خطوة وحدة. لو رجع كائن فاضي، الخطوة سليمة. */
export const validateStep = (type: CampaignType, step: number, v: CampaignFormValues): FieldErrors => {
  const e: FieldErrors = {};

  if (type === 'video') {
    if (step === 1) {
      validateBasics(v, e);
      if (v.videoTypes.length === 0) e.videoTypes = 'اختر نوع محتوى واحد على الأقل';
    }
    if (step === 2) {
      if (v.rules.length === 0) e.dos = 'أضف شرطاً واحداً على الأقل لصانع المحتوى';
    }
    if (step === 3) {
      if (v.selectedPlatforms.length === 0) e.platforms = 'اختر منصة وحدة على الأقل';
      if (!v.videoBudget || v.videoBudget < MIN_VIDEO_BUDGET)
        e.budget = `الميزانية أقل من الحد الأدنى (${MIN_VIDEO_BUDGET.toLocaleString('en-US')} ريال)`;
      if (!v.ratePer1k || v.ratePer1k <= 0) e.rate = 'حدد مبلغ لكل 1,000 مشاهدة أكبر من صفر';
      else if (v.ratePer1k > v.videoBudget) e.rate = 'سعر الألف مشاهدة أكبر من ميزانية الحملة كاملة';
      if (v.access === 'application') {
        const q = v.screeningQuestion.trim();
        if (!q) e.screeningQuestion = 'اكتب سؤال للمتقدمين';
        else if (q.length < 10) e.screeningQuestion = 'السؤال قصير، وضّحه أكثر';
      }
    }
    // الخطوة 4 (مواصفات الصانع) اختيارية
  } else {
    if (step === 1) {
      validateBasics(v, e);
      if (!v.exactCopy.trim()) e.exactCopy = 'اكتب النص اللي لازم يظهر في التصميم';
      if (v.designDos.length === 0) e.dos = 'أضف شرطاً واحداً على الأقل للمصمم';
    }
    if (step === 2) {
      if (v.selectedSizes.length === 0) e.sizes = 'اختر مقاس واحد على الأقل';
      if (v.selectedSizes.includes('مقاس مخصص') && (!v.customWidth || !v.customHeight || v.customWidth < 100 || v.customHeight < 100))
        e.sizes = 'اكتب عرض وارتفاع المقاس المخصص (100 بكسل أو أكثر)';
      if (v.selectedSizes.includes('كاروسيل') && (!v.carouselSlides || v.carouselSlides < 2))
        e.sizes = 'الكاروسيل يحتاج شريحتين على الأقل';
      if (v.selectedFormats.length === 0) e.formats = 'اختر صيغة تسليم وحدة على الأقل';
    }
    if (step === 3) {
      if (!v.pricePerDesign || v.pricePerDesign < MIN_DESIGN_PRICE)
        e.price = `سعر التصميم أقل من الحد الأدنى (${MIN_DESIGN_PRICE} ريال)`;
      if (!v.designsNeeded || v.designsNeeded < 1) e.designsNeeded = 'عدد التصاميم لازم يكون 1 أو أكثر';
    }
  }

  return e;
};

/** أول خطوة فيها خطأ من 1 لين lastStep. لو كلها سليمة يرجع null */
export const firstInvalidStep = (type: CampaignType, lastStep: number, v: CampaignFormValues): number | null => {
  for (let s = 1; s <= lastStep; s++) {
    if (Object.keys(validateStep(type, s, v)).length > 0) return s;
  }
  return null;
};