import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  bg?: string;
  hasShadow?: boolean;
};

export function Card({
  children,
  className,
  bg = 'bg-white',
  hasShadow = true,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'border-4 border-black p-6',
        bg,
        hasShadow && 'shadow-neo-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
