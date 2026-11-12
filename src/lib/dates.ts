import type { Lang } from '../content/content';

const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
};

const parse = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return { y, m };
};

/** "2022-09" → "Sep 2022" */
export function formatMonth(ym: string, lang: Lang): string {
  const { y, m } = parse(ym);
  return `${MONTHS[lang][m - 1]} ${y}`;
}

/** Months between two dates, counting both ends (the way a CV does). */
export function monthsBetween(start: string, end: string | null, now = new Date()): number {
  const a = parse(start);
  const b = end ? parse(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
  return Math.max(1, b.y * 12 + b.m - (a.y * 12 + a.m) + 1);
}

/** 34 → "2 yrs 10 mos" */
export function formatDuration(months: number, lang: Lang): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (lang === 'es') {
    if (years) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
    if (rest) parts.push(`${rest} ${rest === 1 ? 'mes' : 'meses'}`);
  } else {
    if (years) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
    if (rest) parts.push(`${rest} ${rest === 1 ? 'mo' : 'mos'}`);
  }
  return parts.join(' ');
}
