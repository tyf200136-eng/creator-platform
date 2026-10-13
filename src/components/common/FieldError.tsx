import React from 'react';
import { AlertCircle } from 'lucide-react';

/** رسالة الخطأ تحت الخانة. لو ما فيه خطأ ما يطلع شي. */
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p data-field-error className="flex items-center gap-1 text-[11px] text-red-400">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  ) : null;

/** لون إطار الخانة: أحمر لو فيها خطأ، والعادي غير كذا */
export const fieldBorder = (error?: string) => (error ? 'border-red-500/60' : 'border-white/[0.14]');

export default FieldError;