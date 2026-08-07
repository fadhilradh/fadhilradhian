import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';

import { cn } from '../lib/cn.js';

const CONTROL = cn(
  'h-11 w-full rounded-crate border border-rule-strong bg-card px-3 text-base text-ink',
  'placeholder:text-ink-faint',
  'aria-[invalid=true]:border-lane-red',
);

export type FieldProps = {
  label: string;
  /** What to fix, in the imperative. Never "invalid input". */
  error?: string;
  hint?: string;
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
};

/**
 * Label + control + message, wired for screen readers. The error text says what
 * to fix rather than that something is wrong.
 */
export function Field({ label, error, hint, children, className }: FieldProps) {
  const id = useId();
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children({ id, describedBy: messageId, invalid: Boolean(error) })}
      {error ? (
        <p id={messageId} className="text-sm text-lane-red">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...rest} />;
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(CONTROL, 'pr-8', className)} {...rest} />;
}

/** Certification and facet chips. Not interactive on its own. */
export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-crate border border-rule bg-surface-sunk px-1.5 py-0.5',
        'text-[0.6875rem] tracking-stencil text-ink-muted uppercase',
        className,
      )}
    >
      {children}
    </span>
  );
}
