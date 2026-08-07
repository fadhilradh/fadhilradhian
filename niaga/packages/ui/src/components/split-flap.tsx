import { useEffect, useRef, useState } from 'react';

import { cn } from '../lib/cn.js';
import { useReducedMotion } from '../lib/use-reduced-motion.js';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.→ ';

/** ms between glyph swaps, and between the start of one character and the next. */
const SWAP_MS = 34;
const STEP_MS = 26;

/**
 * Split-flap character reveal, as on a port departures board.
 *
 * This is the one orchestrated motion moment in the product. Each character
 * cycles through a few glyphs and lands on its target; the row then sits still.
 * Under `prefers-reduced-motion` the final text renders directly — the effect is
 * decoration, the content is the point.
 */
export type SplitFlapTextProps = {
  text: string;
  /** Delay before this line starts flipping, in ms. Stagger rows with it. */
  delayMs?: number;
  /** Glyph changes per character before landing. */
  cycles?: number;
  className?: string;
};

export function SplitFlapText({ text, delayMs = 0, cycles = 3, className }: SplitFlapTextProps) {
  const reducedMotion = useReducedMotion();
  const [flipped, setFlipped] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (reducedMotion) return;

    const schedule = (fn: () => void, ms: number) => {
      timers.current.push(setTimeout(fn, ms));
    };

    // Reveal left to right, one character at a time.
    for (let index = 0; index < text.length; index += 1) {
      const target = text[index] ?? ' ';
      const charStart = delayMs + index * STEP_MS;

      for (let cycle = 0; cycle < cycles; cycle += 1) {
        schedule(
          () => {
            setFlipped((current) => {
              const glyph = GLYPHS[(index * 7 + cycle * 13) % GLYPHS.length] ?? ' ';
              return current.padEnd(index, ' ').slice(0, index) + glyph;
            });
          },
          charStart + cycle * SWAP_MS,
        );
      }

      schedule(
        () => setFlipped((current) => current.padEnd(index, ' ').slice(0, index) + target),
        charStart + cycles * SWAP_MS,
      );
    }

    return () => {
      for (const timer of timers.current) clearTimeout(timer);
      timers.current = [];
    };
  }, [text, delayMs, cycles, reducedMotion]);

  const rendered = reducedMotion ? text : flipped.padEnd(text.length, ' ');

  return (
    <span className={cn('stencil tabular-nums', className)}>
      {/* Screen readers get the settled text, never the intermediate glyphs. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden className="whitespace-pre">
        {rendered}
      </span>
    </span>
  );
}
