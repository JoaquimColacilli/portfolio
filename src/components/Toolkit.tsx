import { useState, type CSSProperties } from 'react';
import { chapters, languages, practices, toolkit, training, ui } from '../content/content';
import { useLanguage } from '../i18n';

const two = (n: number) => String(n).padStart(2, '0');

/** Places a part can have been used at, oldest first: every chapter that lists a stack. */
const places = chapters.filter((c) => c.stack.length > 0).map((c) => c.title.join(' '));
const parts = toolkit.flatMap((group) => group.parts);
const usedAt = (place: string) => parts.filter((part) => part.usedAt.includes(place)).length;

export function Toolkit({ index }: { index: number }) {
  const { t } = useLanguage();
  const [place, setPlace] = useState<string | null>(null);
  let item = 0;
  return (
    <section className="sheet toolkit" id="toolkit" data-sheet={index} aria-labelledby="toolkit-title">
      <header className="sheet__head">
        <h2 className="sheet__title plot" id="toolkit-title">
          {t(ui.toolkit.heading)}
        </h2>
        <p className="sheet__intro plot" style={{ '--i': 1 } as CSSProperties}>
          {t(ui.toolkit.intro)}
        </p>
      </header>

      <div className="paper">
        <div className="filter" role="group" aria-label={t(ui.toolkit.filter)}>
          <span className="filter__label">{t(ui.toolkit.filter)}</span>
          <button type="button" aria-pressed={place === null} onClick={() => setPlace(null)}>
            {t(ui.toolkit.all)} <span className="filter__count">{parts.length}</span>
          </button>
          {places.map((name) => (
            <button key={name} type="button" aria-pressed={place === name} onClick={() => setPlace(place === name ? null : name)}>
              {name} <span className="filter__count">{usedAt(name)}</span>
            </button>
          ))}
        </div>

        <div className="bom">
          {toolkit.map((group) => (
            <table key={group.group.en}>
              <caption>{t(group.group)}</caption>
              <thead>
                <tr>
                  <th scope="col">N.º</th>
                  <th scope="col">{t(ui.toolkit.part)}</th>
                  <th scope="col">{t(ui.toolkit.usedAt)}</th>
                </tr>
              </thead>
              <tbody>
                {group.parts.map((part) => (
                  <tr key={part.name} data-off={(place !== null && !part.usedAt.includes(place)) || undefined}>
                    <td>{two(++item)}</td>
                    <th scope="row">{part.name}</th>
                    <td>{part.usedAt.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>

        <div className="notes">
          <section aria-labelledby="practices-title">
            <h3 id="practices-title">{t(ui.toolkit.practices)}</h3>
            <ul className="notes__list">
              {practices.map((p) => (
                <li key={p.en}>{t(p)}</li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="education-title">
            <h3 id="education-title">{t(ui.toolkit.education)}</h3>
            <table className="timeline">
              <tbody>
                {training.map((entry) => (
                  <tr key={entry.what.en}>
                    <th scope="row">{entry.when}</th>
                    <td>{t(entry.what)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section aria-labelledby="languages-title">
            <h3 id="languages-title">{t(ui.toolkit.languages)}</h3>
            <dl className="pairs">
              {languages.map((l) => (
                <div key={l.name.en}>
                  <dt>{t(l.name)}</dt>
                  <dd>{t(l.level)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </section>
  );
}
