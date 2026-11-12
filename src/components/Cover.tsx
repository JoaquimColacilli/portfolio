import type { RefObject } from 'react';
import { cover, person, ui } from '../content/content';
import { useLanguage } from '../i18n';
import { goToSheet } from './Header';

export function Cover({ cursorRef }: { cursorRef: RefObject<HTMLSpanElement | null> }) {
  const { t } = useLanguage();
  return (
    <section className="sheet cover" id="cover" data-sheet="0" aria-labelledby="cover-title">
      <div className="cover__body">
        <h1 className="cover__title" id="cover-title" aria-label={person.name}>
          <span className="cover__line" aria-hidden="true">
            <span className="cover__word">{person.firstName}</span>
          </span>
          <span className="cover__line" aria-hidden="true">
            <span className="cover__word">{person.lastName}</span>
            <span className="cover__cursor" ref={cursorRef} />
          </span>
        </h1>
        <div className="cover__text">
          <p className="cover__lede">{t(cover.lede)}</p>
          <p className="cover__now">{t(cover.now)}</p>
          <div className="cover__actions">
            <a className="button" href={t(person.cv)} download>
              {t(ui.downloadCv)}
            </a>
            <a className="link" href="#contact" onClick={(e) => goToSheet(e, 'contact')}>
              {t(ui.getInTouch)}
            </a>
          </div>
        </div>
      </div>
      <p className="cover__hint">
        <span className="cover__hint-line" aria-hidden="true" />
        {t(cover.hint)}
      </p>
    </section>
  );
}
