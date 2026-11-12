import type { CSSProperties } from 'react';
import { ui } from '../content/content';
import { useLanguage } from '../i18n';
import { formatDuration, formatMonth, monthsBetween } from '../lib/dates';

/** Months the full rule stands for. Every chapter is drawn at this same scale. */
const SCALE_MONTHS = 72;

/**
 * A dimension line for time: the bold part is how long the chapter lasted, drawn to
 * scale on a six-year rule, so tenures can be compared at a glance.
 */
export function Dimension({ start, end }: { start: string; end: string | null }) {
  const { lang, t } = useLanguage();
  const months = monthsBetween(start, end);
  const length = Math.min(1, months / SCALE_MONTHS);
  const to = lang === 'es' ? 'a' : 'to';
  return (
    <div className="dim plot" style={{ '--len': length } as CSSProperties}>
      <p className="dim__duration">{formatDuration(months, lang)}</p>
      <div className="dim__rule" aria-hidden="true">
        <span className="dim__measure" data-open={end === null || undefined} />
        {Array.from({ length: SCALE_MONTHS / 12 + 1 }, (_, i) => (
          <span key={i} className="dim__year" style={{ left: `${(i / (SCALE_MONTHS / 12)) * 100}%` }} />
        ))}
      </div>
      <p className="dim__dates">
        <span>
          <time dateTime={start}>{formatMonth(start, lang)}</time> {to}{' '}
          {end ? <time dateTime={end}>{formatMonth(end, lang)}</time> : t(ui.present).toLowerCase()}
        </span>
        <span className="dim__scale">{t(ui.rule)}</span>
      </p>
    </div>
  );
}
