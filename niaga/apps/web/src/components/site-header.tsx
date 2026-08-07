import { Button, ThemeToggle, cn } from '@niaga/ui';
import { Link } from '@tanstack/react-router';

import { useI18n } from '../lib/i18n.js';

/** ID | EN, drawn as a two-position switch rather than a dropdown: there are
 *  exactly two languages and hiding one behind a menu costs a click. */
function LocaleSwitch() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('nav.locale')}
      className="flex h-11 items-center rounded-crate border border-rule"
    >
      {(['id', 'en'] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={locale === option}
          onClick={() => setLocale(option)}
          className={cn(
            'stencil h-full px-2.5 text-xs',
            locale === option
              ? 'bg-lane-green text-on-lane'
              : 'text-ink-muted hover:text-ink hover:bg-surface-sunk',
            option === 'id' ? 'rounded-l-crate' : 'rounded-r-crate',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const { t } = useI18n();

  return (
    <header className="hairline-b sticky top-0 z-20 bg-surface/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="signage text-lg text-ink" aria-label="Niaga">
          NIAGA
        </Link>

        <nav className="ml-4 hidden items-center gap-4 sm:flex" aria-label={t('nav.menu')}>
          <Link
            to="/telusuri"
            className="text-sm text-ink-muted hover:text-ink"
            activeProps={{ className: 'text-ink' }}
          >
            {t('nav.browse')}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitch />
          <ThemeToggle label={t('nav.theme')} />
          <Button variant="ghost" size="md" className="hidden sm:inline-flex">
            {t('nav.signIn')}
          </Button>
          <Button variant="primary" size="md">
            {t('nav.signUp')}
          </Button>
        </div>
      </div>
    </header>
  );
}
