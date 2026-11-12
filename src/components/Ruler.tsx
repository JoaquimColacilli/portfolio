import { sheets } from '../content/sheets';
import { useLanguage } from '../i18n';
import { stage } from '../lib/stage';
import { useSheetIndex } from '../lib/useStage';

/**
 * A scale rule down the left edge: one division per sheet, an amber pointer for the
 * current position. Each division is a button.
 */
export function Ruler() {
  const { t, lang } = useLanguage();
  const active = useSheetIndex();
  return (
    <nav className="ruler" aria-label={lang === 'es' ? 'Láminas' : 'Sheets'}>
      <ol>
        {sheets.map((sheet, i) => (
          <li key={sheet.id}>
            <button type="button" aria-current={i === active ? 'step' : undefined} onClick={() => stage.jump(i)}>
              <span className="ruler__tick" aria-hidden="true" />
              <span className="ruler__label">{t(sheet.short)}</span>
            </button>
          </li>
        ))}
      </ol>
      <span className="ruler__pointer" aria-hidden="true" />
    </nav>
  );
}
