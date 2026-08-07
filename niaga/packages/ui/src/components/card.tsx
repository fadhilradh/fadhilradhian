import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn.js';

/**
 * A panel. Hairline border, 2px corners, no shadow — depth in this system comes
 * from rules and surface value, never from blur.
 */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-crate border border-rule bg-card', className)} {...rest} />;
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('hairline-b px-4 py-3', className)} {...rest} />;
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 py-3', className)} {...rest} />;
}

export function Rule({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('border-0 border-t border-rule', className)} {...rest} />;
}
