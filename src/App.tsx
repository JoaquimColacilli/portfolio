import { useEffect, useRef } from 'react';
import { ChapterSheet } from './components/ChapterSheet';
import { Contact } from './components/Contact';
import { Cover } from './components/Cover';
import { Header } from './components/Header';
import { Ruler } from './components/Ruler';
import { TitleBlock } from './components/TitleBlock';
import { Toolkit } from './components/Toolkit';
import { Work } from './components/Work';
import { chapters, closing, ui } from './content/content';
import { sheetIndex } from './content/sheets';
import { useLanguage } from './i18n';
import { startRuntime, type Runtime } from './runtime';

export function App() {
  const { lang, t } = useLanguage();
  const world = useRef<HTMLDivElement>(null);
  const lineStart = useRef<HTMLSpanElement>(null);
  const lineEnd = useRef<HTMLSpanElement>(null);
  const runtime = useRef<Runtime | null>(null);

  useEffect(() => {
    if (!world.current) return;
    const instance = startRuntime({ host: world.current, origin: lineStart.current, end: lineEnd.current });
    runtime.current = instance;
    return () => {
      runtime.current = null;
      instance.dispose();
    };
  }, []);

  // Another language means other line lengths: sheets are measured again and the line
  // is re-anchored to the two cursors.
  useEffect(() => {
    runtime.current?.refresh();
  }, [lang]);

  return (
    <>
      <a className="skip" href="#main">
        {t(ui.skip)}
      </a>
      <div className="world" ref={world} aria-hidden="true" />
      <Header />
      <Ruler />
      <main id="main" tabIndex={-1}>
        <Cover cursorRef={lineStart} />
        {chapters.map((chapter) => (
          <ChapterSheet key={chapter.id} chapter={chapter} index={sheetIndex(chapter.id)} />
        ))}
        <Work index={sheetIndex(closing.work.id)} />
        <Toolkit index={sheetIndex(closing.toolkit.id)} />
        <Contact index={sheetIndex(closing.contact.id)} cursorRef={lineEnd} />
      </main>
      <TitleBlock />
    </>
  );
}
