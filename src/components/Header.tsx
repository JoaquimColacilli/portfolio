import { person, ui } from '../content/content';
import { sheetIndex } from '../content/sheets';
import { useLanguage } from '../i18n';
import { stage } from '../lib/stage';

const NAV = [
  { key: 'experience', target: 'escuela-tecnica' },
  { key: 'work', target: 'work' },
  { key: 'toolkit', target: 'toolkit' },
  { key: 'contact', target: 'contact' },
] as const;

export function goToSheet(event: React.MouseEvent, id: string): void {
  const index = sheetIndex(id);
  if (index < 0) return;
  event.preventDefault();
  stage.jump(index);
  try {
    history.replaceState(null, '', `#${id}`);
  } catch {
    // some embedded contexts do not allow it; the jump itself has already happened
  }
}

export function Header() {
  const { lang, setLang, t } = useLanguage();
  return (
    <header className="header">
      <a className="header__name" href="#cover" onClick={(e) => goToSheet(e, 'cover')}>
        {person.name}
      </a>
      <nav className="header__nav" aria-label={lang === 'es' ? 'Secciones' : 'Sections'}>
        {NAV.map((item) => (
          <a key={item.key} href={`#${item.target}`} onClick={(e) => goToSheet(e, item.target)}>
            {t(ui.nav[item.key])}
          </a>
        ))}
      </nav>
      <div className="header__tools">
        <div className="lang" role="group" aria-label={t(ui.language)}>
          {(['en', 'es'] as const).map((code) => (
            <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <a className="header__cv" href={t(person.cv)} download>
          {t(ui.downloadCv)}
        </a>
      </div>
    </header>
  );
}
