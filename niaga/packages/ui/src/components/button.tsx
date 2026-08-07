import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/cn.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-lane-green text-on-lane border border-lane-green hover:brightness-110 active:brightness-95',
  secondary: 'bg-card text-ink border border-rule-strong hover:bg-surface-sunk',
  ghost:
    'bg-transparent text-ink-muted border border-transparent hover:text-ink hover:bg-surface-sunk',
  danger: 'bg-lane-red text-on-lane border border-lane-red hover:brightness-110',
};

/** sm is for dense toolbars only. md and lg clear the 44px target floor. */
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders before the label; keep to 16px icons. */
  leading?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  leading,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-crate font-medium',
        'transition-[filter,background-color,color] duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {leading}
      {children}
    </button>
  );
}
