import { person, ui } from '../content/content';
import { sheetIndex } from '../content/sheets';
import { useLanguage } from '../i18n';
import { setMode, useMode } from '../lib/mode';
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

/** Sun by day, moon by night. Pressing it switches the whole site, drawings included. */
function ModeSwitch() {
  const { t } = useLanguage();
  const night = useMode() === 'night';
  const label = t(night ? ui.mode.toDay : ui.mode.toNight);
  return (
    <button type="button" className="mode" aria-label={label} title={label} onClick={() => setMode(night ? 'day' : 'night')}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <mask id="mode-bite">
          <rect width="24" height="24" fill="#fff" />
          <circle className="mode__bite" cx="12" cy="12" r="7" fill="#000" />
        </mask>
        <circle className="mode__disc" cx="12" cy="12" r="4.4" mask="url(#mode-bite)" />
        <g className="mode__rays">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line key={angle} x1="12" y1="2.6" x2="12" y2="5" transform={`rotate(${angle} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
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
        <ModeSwitch />
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
