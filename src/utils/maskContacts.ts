// يخفي أرقام الجوال والإيميلات والروابط الخارجية من نص الرسالة
// ملاحظة: هذا للواجهة فقط، ولازم يتكرر نفس الفحص في السيرفر لأن المتصفح سهل يتجاوز

const MASK = '•••';

// الأرقام العربية (٠-٩) والفارسية تتحول لإنجليزية قبل الفحص
const normalizeDigits = (s: string) =>
  s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

const PATTERNS: RegExp[] = [
  // إيميل
  /[A-Za-z0-9._%+-]+\s*(@|\(at\)|\[at\])\s*[A-Za-z0-9.-]+\s*\.\s*[A-Za-z]{2,}/gi,
  // روابط: http / www / نطاقات شائعة
  /\b(?:https?:\/\/|www\.)\S+/gi,
  /\b[A-Za-z0-9-]+\.(?:com|net|org|sa|io|me|ly|co|app|link|info|biz)(?:\/\S*)?\b/gi,
  // واتساب وتيليجرام
  /\b(?:wa\.me|t\.me)\/\S+/gi,
  // أرقام: 8 أرقام فأكثر حتى لو بينها مسافات أو شرطات (+966 5x xxx xxxx / 05xxxxxxxx)
  /\+?\d(?:[\s\-().]*\d){7,}/g,
];

export const maskContacts = (input: string): { text: string; masked: boolean } => {
  let text = normalizeDigits(input);
  let masked = false;
  for (const re of PATTERNS) {
    text = text.replace(re, () => {
      masked = true;
      return MASK;
    });
  }
  return { text: masked ? text : input, masked };
};

export const MASK_WARNING = 'حفاظاً على حقوقك، يجب أن يتم التعامل داخل المنصة';