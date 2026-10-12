import React from 'react';

interface RiyalSymbolProps {
  className?: string;
  size?: number | string;
}

/**
 * رمز الريال السعودي الرسمي — نفس شكل public/riyal-symbol.svg
 * الحجم الافتراضي يتبع حجم الخط (em) عشان يتناسق مع النص اللي جنبه
 */
export const RiyalSymbol: React.FC<RiyalSymbolProps> = ({
  className = 'inline-block w-[0.85em] h-[0.95em] align-[-0.12em] shrink-0',
  size,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="40 0 1140 1270"
      fill="currentColor"
      aria-label="ريال سعودي"
      role="img"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <path d="M750,1119 C730,1163,716,1211,711,1262 C711,1262,1136,1172,1136,1172 C1156,1127,1169,1079,1174,1028 C1174,1028,750,1119,750,1119Z M1136,901 C1156,857,1169,809,1174,758 L843,828 L843,693 L1136,631 C1156,587,1169,538,1174,488 L843,558 L843,72 C793,100,748,138,711,183 L711,586 L579,614 L579,6 C528,34,483,72,447,117 L447,642 L151,705 C131,750,117,798,112,849 L447,777 L447,948 L88,1024 C68,1068,55,1117,50,1167 L425,1088 C456,1081,482,1063,499,1038 L568,936 C575,926,579,913,579,899 L579,749 L711,721 L711,992 Z" />
    </svg>
  );
};

/**
 * يحوّل أي نص فيه "﷼" إلى نص + أيقونة الريال.
 * نستخدمه للنصوص اللي تجي كـ string (رسائل التنبيه، التسميات، بيانات الرسوم البيانية)
 */
export const RiyalText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split('﷼');
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && <RiyalSymbol />}
        </React.Fragment>
      ))}
    </>
  );
};

export default RiyalSymbol;