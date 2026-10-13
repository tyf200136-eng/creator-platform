/**
 * فحوصات مشتركة لكل نماذج الموقع.
 * ملاحظة: هذي فحوصات الواجهة فقط لراحة المستخدم. لازم السيرفر يعيد نفس الفحص.
 */

// ---------------------------------------------------------------------------
// أرقام
// ---------------------------------------------------------------------------

/** يحوّل الأرقام العربية (٠١٢) والفارسية (۰۱۲) إلى إنجليزية */
export const toEnglishDigits = (value: string) =>
  value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

/** يرجّع الأرقام بس (يشيل المسافات والشرطات ويحوّل العربي) */
export const onlyDigits = (value: string) => toEnglishDigits(value).replace(/\D/g, '');

// ---------------------------------------------------------------------------
// الجوال السعودي
// ---------------------------------------------------------------------------

/**
 * يقبل: 5XXXXXXXX أو 05XXXXXXXX أو 9665XXXXXXXX أو +9665XXXXXXXX
 * ويرجّع الرقم بصيغة 5XXXXXXXX (9 أرقام) أو null لو غلط.
 */
export const normalizeSaudiPhone = (value: string): string | null => {
  let d = onlyDigits(value);
  if (d.startsWith('00966')) d = d.slice(5);
  else if (d.startsWith('966')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return /^5\d{8}$/.test(d) ? d : null;
};

export const phoneError = (value: string): string | undefined => {
  if (!value.trim()) return 'اكتب رقم الجوال';
  if (!normalizeSaudiPhone(value)) return 'رقم الجوال غير صحيح. لازم يبدأ بـ 5 ويتكون من 9 أرقام';
  return undefined;
};

// ---------------------------------------------------------------------------
// البطاقات
// ---------------------------------------------------------------------------

export type CardBrand = 'mada' | 'visa' | 'mastercard' | 'amex' | 'unknown';

/**
 * بدايات بطاقات مدى (قائمة جزئية لأشهر البنوك).
 * بوابة الدفع هي اللي تحدد النوع النهائي، وهذي بس عشان نعرض الشعار الصح.
 */
const MADA_BINS = [
  '440647', '440795', '446404', '457865', '968208', '457997', '474491', '636120',
  '417633', '468540', '468541', '468542', '468543', '968201', '446393', '588845',
  '588846', '588847', '588848', '588849', '588850', '588851', '409201', '458456',
  '484783', '968205', '462220', '455708', '410621', '455036', '486094', '486095',
  '486096', '504300', '440533', '489317', '489318', '489319', '445564', '968211',
  '401757', '410685', '432328', '428671', '428672', '428673', '968206', '446672',
  '543357', '434107', '431361', '604906', '521076', '529415', '535825', '543085',
  '524130', '554180', '549760', '968202', '535989', '536023', '513213', '585265',
  '588983', '588982', '589005', '508160', '531095', '530906', '532013', '968204',
  '422817', '422818', '422819', '428331', '483010', '483011', '483012', '589206',
  '968207', '419593', '439954', '407197', '407395', '520058', '530060', '531196',
  '539931', '412565', '968203', '524514', '529741', '537767', '557606', '558563',
  '968209', '406136', '406996', '426681', '426683',
];

export const detectCardBrand = (number: string): CardBrand => {
  const d = onlyDigits(number);
  if (MADA_BINS.some((bin) => d.startsWith(bin))) return 'mada';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(d)) return 'mastercard';
  if (/^4/.test(d)) return 'visa';
  return 'unknown';
};

/** خوارزمية Luhn: تكشف الأرقام المكتوبة غلط */
export const passesLuhn = (number: string) => {
  const d = onlyDigits(number);
  let sum = 0;
  let double = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return d.length > 0 && sum % 10 === 0;
};

/** يقسّم رقم البطاقة لمجموعات: 4-4-4-4 (أو 4-6-5 لأمريكان إكسبريس) */
export const formatCardNumber = (value: string) => {
  const d = onlyDigits(value);
  if (detectCardBrand(d) === 'amex') {
    const x = d.slice(0, 15);
    return [x.slice(0, 4), x.slice(4, 10), x.slice(10)].filter(Boolean).join(' ');
  }
  return d.slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
};

/** يكتب تاريخ الانتهاء بصيغة MM/YY أثناء الكتابة */
export const formatExpiry = (value: string) => {
  const d = onlyDigits(value).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export const cardNumberError = (value: string): string | undefined => {
  const d = onlyDigits(value);
  if (!d) return 'اكتب رقم البطاقة';
  const brand = detectCardBrand(d);
  const expected = brand === 'amex' ? 15 : 16;
  if (d.length !== expected) return `رقم البطاقة لازم يكون ${expected} رقم`;
  if (!passesLuhn(d)) return 'رقم البطاقة غير صحيح، تأكد منه';
  if (brand === 'unknown') return 'نقبل بطاقات مدى وفيزا وماستركارد وأمريكان إكسبريس فقط';
  return undefined;
};

export const cardHolderError = (value: string): string | undefined => {
  const v = value.trim();
  if (!v) return 'اكتب الاسم كما هو مكتوب على البطاقة';
  if (v.length < 3) return 'الاسم قصير';
  if (!/^[A-Za-z؀-ۿ .'-]+$/.test(v)) return 'الاسم لازم يكون حروف بس';
  return undefined;
};

export const expiryError = (value: string): string | undefined => {
  const d = onlyDigits(value);
  if (!d) return 'اكتب تاريخ الانتهاء';
  if (d.length !== 4) return 'الصيغة: شهر/سنة (مثل 08/28)';
  const month = Number(d.slice(0, 2));
  const year = 2000 + Number(d.slice(2));
  if (month < 1 || month > 12) return 'الشهر لازم يكون من 01 إلى 12';
  const now = new Date();
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  if (endOfMonth < now) return 'البطاقة منتهية';
  if (year > now.getFullYear() + 20) return 'تاريخ الانتهاء غير منطقي';
  return undefined;
};

export const cvvError = (value: string, brand: CardBrand): string | undefined => {
  const d = onlyDigits(value);
  const len = brand === 'amex' ? 4 : 3;
  if (!d) return 'اكتب رمز الأمان (CVV)';
  if (d.length !== len) return `رمز الأمان ${len} أرقام، تلقاه ورا البطاقة`;
  return undefined;
};

// ---------------------------------------------------------------------------
// الآيبان السعودي
// ---------------------------------------------------------------------------

/** يرجّع الآيبان بدون مسافات وبحروف كبيرة */
export const normalizeIban = (value: string) => toEnglishDigits(value).replace(/\s+/g, '').toUpperCase();

/** آيبان سعودي: SA + 22 رقم، مع فحص رقم التحقق الدولي (mod 97) */
export const ibanError = (value: string): string | undefined => {
  const v = normalizeIban(value);
  if (!v) return 'اكتب رقم الآيبان';
  if (!v.startsWith('SA')) return 'الآيبان السعودي يبدأ بـ SA';
  if (!/^SA\d{22}$/.test(v)) return 'الآيبان لازم يكون SA و 22 رقم بعدها';
  const rearranged = v.slice(4) + v.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rem = 0;
  for (const ch of numeric) rem = (rem * 10 + Number(ch)) % 97;
  if (rem !== 1) return 'رقم الآيبان غير صحيح، تأكد منه';
  return undefined;
};

/** يقسّم الآيبان لمجموعات من 4 للعرض */
export const formatIban = (value: string) => normalizeIban(value).slice(0, 24).replace(/(.{4})(?=.)/g, '$1 ');

// ---------------------------------------------------------------------------
// الإيميل والروابط
// ---------------------------------------------------------------------------

export const emailError = (value: string, required = true): string | undefined => {
  const v = value.trim();
  if (!v) return required ? 'اكتب البريد الإلكتروني' : undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'البريد الإلكتروني غير صحيح';
  return undefined;
};

/**
 * يفحص إن الرابط https صحيح، واختيارياً إنه من مواقع معيّنة.
 * مثال: urlError(v, { hosts: ['instagram.com'], label: 'إنستقرام' })
 */
export const urlError = (
  value: string,
  opts: { required?: boolean; hosts?: string[]; label?: string } = {}
): string | undefined => {
  const v = value.trim();
  if (!v) return opts.required ? 'اكتب الرابط' : undefined;
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return 'الرابط غير صحيح. لازم يبدأ بـ https://';
  }
  if (u.protocol !== 'https:') return 'الرابط لازم يبدأ بـ https://';
  if (!u.hostname.includes('.')) return 'الرابط غير صحيح';
  if (opts.hosts?.length) {
    const host = u.hostname.replace(/^www\./, '');
    const ok = opts.hosts.some((h) => host === h || host.endsWith('.' + h));
    if (!ok) return `الرابط لازم يكون من ${opts.label ?? opts.hosts.join(' أو ')}`;
  }
  return undefined;
};

// ---------------------------------------------------------------------------
// روابط المنصات وروابط ملفات التصميم
// ---------------------------------------------------------------------------

/** المواقع المقبولة لكل منصة (روابط المقاطع وروابط الحسابات) */
export const PLATFORM_HOSTS: Record<string, { hosts: string[]; label: string }> = {
  tiktok: { hosts: ['tiktok.com'], label: 'تيك توك' },
  instagram: { hosts: ['instagram.com'], label: 'إنستقرام' },
  youtube: { hosts: ['youtube.com', 'youtu.be'], label: 'يوتيوب' },
  snapchat: { hosts: ['snapchat.com'], label: 'سناب شات' },
  x: { hosts: ['x.com', 'twitter.com'], label: 'إكس' },
};

/** رابط لازم يكون من منصة معيّنة (مثل: رابط مقطع تيك توك) */
export const platformUrlError = (value: string, platform: string, required = true) => {
  const p = PLATFORM_HOSTS[platform];
  return urlError(value, { required, hosts: p?.hosts, label: p?.label });
};

/** روابط ملفات التصميم المقبولة */
export const DESIGN_SOURCE_HOSTS = ['figma.com', 'canva.com', 'drive.google.com', 'docs.google.com'];

export const designSourceUrlError = (value: string, required = true) =>
  urlError(value, { required, hosts: DESIGN_SOURCE_HOSTS, label: 'فيقما أو كانفا أو قوقل درايف' });

// ---------------------------------------------------------------------------
// بيانات المنشآت السعودية
// ---------------------------------------------------------------------------

/** جوال أو هاتف ثابت سعودي (للمنشآت): 05XXXXXXXX أو 01XXXXXXXX (مثل 011 488 9900) */
export const saudiContactPhoneError = (value: string, required = true): string | undefined => {
  if (!value.trim()) return required ? 'اكتب رقم التواصل' : undefined;
  let d = onlyDigits(value);
  if (d.startsWith('00966')) d = d.slice(5);
  else if (d.startsWith('966')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  if (/^5\d{8}$/.test(d) || /^1[1-7]\d{7}$/.test(d)) return undefined;
  return 'رقم غير صحيح. اكتب جوال (05XXXXXXXX) أو هاتف ثابت (011XXXXXXX)';
};

/** السجل التجاري أو الرقم الموحد: 10 أرقام */
export const crNumberError = (value: string, required = false): string | undefined => {
  const d = onlyDigits(value);
  if (!d) return required ? 'اكتب رقم السجل التجاري' : undefined;
  if (d.length !== 10) return 'رقم السجل التجاري 10 أرقام';
  return undefined;
};

/** الرقم الضريبي (VAT): 15 رقم يبدأ بـ 3 وينتهي بـ 3 */
export const vatNumberError = (value: string, required = false): string | undefined => {
  const d = onlyDigits(value);
  if (!d) return required ? 'اكتب الرقم الضريبي' : undefined;
  if (d.length !== 15) return 'الرقم الضريبي 15 رقم';
  if (!d.startsWith('3') || !d.endsWith('3')) return 'الرقم الضريبي يبدأ بـ 3 وينتهي بـ 3';
  return undefined;
};