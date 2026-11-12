import type { CSSProperties } from 'react';
import { ui, type Chapter } from '../content/content';
import { useLanguage } from '../i18n';
import { Dimension } from './Dimension';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

export function ChapterSheet({ chapter, index }: { chapter: Chapter; index: number }) {
  const { t } = useLanguage();
  let i = 0;
  return (
    <section className="sheet chapter" id={chapter.id} data-sheet={index} aria-labelledby={`${chapter.id}-title`}>
      <div className="chapter__pin">
        <div className="chapter__text">
          <h2 className="chapter__title" id={`${chapter.id}-title`}>
            {chapter.title.map((line) => (
              <span key={line} className="plot" style={step(i++)}>
                {line}
              </span>
            ))}
          </h2>
          <p className="chapter__role plot" style={step(i++)}>
            {t(chapter.role)}
          </p>
          <div style={step(i++)} className="chapter__dim">
            <Dimension start={chapter.start} end={chapter.end} />
          </div>
          {chapter.intro && (
            <p className="chapter__intro plot" style={step(i++)}>
              {t(chapter.intro)}
            </p>
          )}
          {chapter.points.length > 0 && (
            <ul className="chapter__points">
              {chapter.points.map((point) => (
                <li key={point.en} className="plot" style={step(i++)}>
                  {t(point)}
                </li>
              ))}
            </ul>
          )}
          {chapter.stack.length > 0 && (
            <p className="chapter__stack plot" style={step(i++)}>
              <span>{t(ui.builtWith)}</span> {chapter.stack.join(', ')}
            </p>
          )}
          {chapter.also && (
            <p className="chapter__also plot" style={step(i++)}>
              <span>{t(chapter.also.title)}</span> {t(chapter.also.text)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
