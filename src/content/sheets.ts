import { chapters, closing, person, ui, type Text } from './content';

/** One entry per sheet, in page order. The 3D world has one viewpoint for each. */
export interface SheetInfo {
  id: string;
  /** label on the ruler */
  short: Text;
  /** title-block title */
  title: Text;
  /** title-block period */
  period: Text;
}

const year = (ym: string) => ym.slice(0, 4);
const same = (s: string): Text => ({ en: s, es: s });
const thisYear = String(new Date().getFullYear());

export const sheets: SheetInfo[] = [
  { id: 'cover', short: ui.cover, title: same(person.name), period: same(`${year(chapters[0].start)}–${thisYear}`) },
  ...chapters.map((c) => ({
    id: c.id,
    short: c.short,
    title: same(c.title.join(' ')),
    period: c.end ? same(`${year(c.start)}–${year(c.end)}`) : { en: `${year(c.start)}–now`, es: `${year(c.start)}–hoy` },
  })),
  { id: closing.work.id, short: closing.work.short, title: ui.work.heading, period: same(thisYear) },
  { id: closing.toolkit.id, short: closing.toolkit.short, title: ui.toolkit.heading, period: same(thisYear) },
  { id: closing.contact.id, short: closing.contact.short, title: ui.contact.heading, period: same(thisYear) },
];

export const sheetIndex = (id: string) => sheets.findIndex((s) => s.id === id);
