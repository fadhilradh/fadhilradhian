import { useEffect, useState } from 'react';

/**
 * Tracks `prefers-reduced-motion`. Live rather than read-once, because the OS
 * setting can change while the tab is open and the manifest board should stop
 * ticking the moment it does.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );

  useEffect(() => {
    const query = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
