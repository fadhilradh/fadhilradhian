import { cn } from '../lib/cn.js';
import { useTheme } from './theme-provider.js';

/** Sun/moon glyphs kept inline so the design system carries no icon dependency. */
function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none" stroke="currentColor">
      <path
        d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5Z"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none" stroke="currentColor">
      <circle cx="8" cy="8" r="3" strokeWidth="1.3" />
      <path
        d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ThemeToggle({
  className,
  label,
}: {
  className?: string;
  /** Localised accessible name, e.g. "Ganti tema" / "Switch theme". */
  label: string;
}) {
  const { resolved, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-crate border border-rule',
        'text-ink-muted hover:text-ink hover:bg-surface-sunk',
        className,
      )}
    >
      {resolved === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
