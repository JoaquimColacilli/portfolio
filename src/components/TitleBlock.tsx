import { useEffect, useId, useRef, useState } from 'react';
import { ui } from '../content/content';
import { sheets } from '../content/sheets';
import { useLanguage } from '../i18n';
import { stage } from '../lib/stage';
import { useSheetIndex } from '../lib/useStage';

const two = (n: number) => String(n).padStart(2, '0');

/**
 * The title block every drawing sheet carries in its corner: sheet number, title and
 * period. It follows the scroll, and opens the list of sheets.
 */
export function TitleBlock() {
  const { t } = useLanguage();
  const index = useSheetIndex();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const sheet = sheets[index];

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !root.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="titleblock" ref={root} data-open={open || undefined}>
      {open && (
        <ol className="titleblock__list" id={listId}>
          {sheets.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                aria-current={i === index ? 'step' : undefined}
                onClick={() => {
                  stage.jump(i);
                  setOpen(false);
                }}
              >
                <span>{two(i)}</span>
                <span>{t(s.title)}</span>
                <span>{t(s.period)}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <button
        type="button"
        className="titleblock__bar"
        aria-label={`${t(ui.sheets)}. ${t(ui.sheet)} ${two(index)}, ${t(sheet.title)}`}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="titleblock__cell">
          <span className="titleblock__label">{t(ui.sheet)}</span>
          <span className="titleblock__value" key={`n${index}`}>
            {two(index)}
            <span className="titleblock__of"> / {two(sheets.length - 1)}</span>
          </span>
        </span>
        <span className="titleblock__cell titleblock__cell--title">
          <span className="titleblock__label">{t(ui.title)}</span>
          <span className="titleblock__value" key={`t${index}`}>
            {t(sheet.title)}
          </span>
        </span>
        <span className="titleblock__cell">
          <span className="titleblock__label">{t(ui.period)}</span>
          <span className="titleblock__value" key={`p${index}`}>
            {t(sheet.period)}
          </span>
        </span>
        <span className="titleblock__cell titleblock__more" aria-hidden="true">
          <svg viewBox="0 0 14 12" width="14" height="12">
            <path d="M0 1h14M0 6h9M0 11h12" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
      </button>
    </div>
  );
}
