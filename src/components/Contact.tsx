import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { person, ui } from '../content/content';
import { useLanguage } from '../i18n';
import { useBackend } from '../lib/backend';

export function Contact({ index, cursorRef }: { index: number; cursorRef: RefObject<HTMLSpanElement | null> }) {
  const { t } = useLanguage();
  const backend = useBackend();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // clipboard blocked: the address stays on screen to be selected by hand
    }
  };

  return (
    <section className="sheet contact" id="contact" data-sheet={index} aria-labelledby="contact-title">
      <div className="contact__body">
        <h2 className="contact__title" id="contact-title">
          <span className="plot">{t(ui.contact.heading)}</span>
          <span className="contact__cursor" ref={cursorRef} aria-hidden="true" />
        </h2>
        <p className="contact__intro plot" style={{ '--i': 2 } as CSSProperties}>
          {t(ui.contact.intro)}
        </p>

        <dl className="contact__block plot" style={{ '--i': 5 } as CSSProperties}>
          <div className="contact__email">
            <dt>{t(ui.contact.email)}</dt>
            <dd>
              <a href={`mailto:${person.email}`}>{person.email}</a>
              <button type="button" className="link" onClick={copy}>
                {t(copied ? ui.contact.copied : ui.contact.copy)}
              </button>
              <span className="visually-hidden" role="status">
                {copied ? t(ui.contact.copied) : ''}
              </span>
            </dd>
          </div>
          <div>
            <dt>{t(ui.contact.profiles)}</dt>
            <dd>
              <a href={person.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={person.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </dd>
          </div>
          <div>
            <dt>{t(ui.contact.cv)}</dt>
            <dd>
              <a href={person.cv.en} download>
                English
              </a>
              <a href={person.cv.es} download>
                Español
              </a>
            </dd>
          </div>
          <div>
            <dt>{t(ui.contact.location)}</dt>
            <dd>{t(person.location)}</dd>
          </div>
          <div className="contact__author">
            <dt>{t(ui.contact.drawnBy)}</dt>
            <dd>
              <img src="images/portrait.webp" width={360} height={360} loading="lazy" decoding="async" alt={t(ui.contact.portraitAlt)} />
              {person.name}
            </dd>
          </div>
        </dl>
      </div>
      <footer className="colophon">
        <p>
          © {new Date().getFullYear()} {person.name}
        </p>
        <p>
          {(backend === 'webgpu' || backend === 'webgl2') && `${t(ui.contact.drawnWith).replace('{backend}', backend === 'webgpu' ? 'WebGPU' : 'WebGL 2')} `}
          {t(ui.contact.typeface)}
        </p>
      </footer>
    </section>
  );
}
