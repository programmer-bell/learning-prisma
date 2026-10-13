import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', label, error, id, 'aria-describedby': describedBy, ...props },
  ref
) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const accessibleDescription = [describedBy, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-black uppercase tracking-wide text-black">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={accessibleDescription}
          className={clsx(
            'w-full border-4 border-black bg-white p-3 font-bold text-black outline-none transition-all duration-75',
            'shadow-neo-sm focus:shadow-neo-md focus:translate-x-[-2px] focus:translate-y-[-2px]',
            'placeholder:text-zinc-500 placeholder:font-medium',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            error && 'border-red-500 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]',
            className
          )}
          {...props}
        />
        {error && (
          <span id={errorId} role="alert" className="text-xs font-black uppercase text-red-600 bg-red-100 border border-red-500 px-2 py-0.5 self-start shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </span>
        )}
      </div>
    );
});

Input.displayName = 'Input';
