import { useRef, useState, type CSSProperties } from 'react';
import { ui } from '../content/content';
import { projects, type Project } from '../content/projects';
import { useLanguage } from '../i18n';

const image = (p: Project, width: 640 | 1280) => `images/projects/${p.slug}-${width}.webp`;
const two = (n: number) => String(n).padStart(2, '0');

export function Work({ index }: { index: number }) {
  const { t } = useLanguage();
  const featured = projects.filter((p) => p.featured);
  const [hovered, setHovered] = useState<Project | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  // The preview follows the pointer through CSS variables, without re-rendering. It sits
  // above and to the right of the pointer, so the row being read stays uncovered.
  const follow = (event: React.PointerEvent) => {
    const el = preview.current;
    if (event.pointerType !== 'mouse' || !el) return;
    const width = el.offsetWidth;
    const height = width * 0.625;
    const x = Math.min(event.clientX + 24, window.innerWidth - width - 16);
    const above = event.clientY - height - 22;
    el.style.setProperty('--x', `${Math.round(x)}px`);
    el.style.setProperty('--y', `${Math.round(above > 76 ? above : event.clientY + 26)}px`);
  };

  return (
    <section className="sheet work" id="work" data-sheet={index} aria-labelledby="work-title">
      <header className="sheet__head">
        <h2 className="sheet__title plot" id="work-title">
          {t(ui.work.heading)}
        </h2>
        <p className="sheet__intro plot" style={{ '--i': 1 } as CSSProperties}>
          {t(ui.work.intro)}
        </p>
      </header>

      <div className="figures">
        {featured.map((p, i) => (
          <figure className="figure" key={p.slug}>
            <a className="figure__frame" href={p.live ?? p.source} target="_blank" rel="noreferrer" aria-label={`${p.title}: ${t(ui.work.live)}`}>
              <img
                src={image(p, 1280)}
                srcSet={`${image(p, 640)} 640w, ${image(p, 1280)} 1280w`}
                sizes="(min-width: 900px) 46vw, 92vw"
                width={1280}
                height={800}
                loading="lazy"
                decoding="async"
                alt=""
              />
            </a>
            <figcaption>
              <p className="figure__no">
                {t(ui.work.figure)} {i + 1}
              </p>
              <h3 className="figure__title">{p.title}</h3>
              <p className="figure__text">{t(p.description)}</p>
              <p className="figure__meta">
                {t(ui.work.kinds[p.kind])}. {p.stack.join(', ')}.
              </p>
              <ProjectLinks project={p} />
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="index paper" onPointerMove={follow} onPointerLeave={() => setHovered(null)}>
        <h3 className="index__title">{t(ui.work.index)}</h3>
        <table role="table">
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" scope="col">
                N.º
              </th>
              <th role="columnheader" scope="col">
                {t(ui.work.project)}
              </th>
              <th role="columnheader" scope="col" className="index__kind">
                {t(ui.work.kind)}
              </th>
              <th role="columnheader" scope="col" className="index__stack">
                {t(ui.work.stack)}
              </th>
              <th role="columnheader" scope="col">
                {t(ui.work.links)}
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {projects.map((p, i) => (
              <tr role="row" key={p.slug} onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(p)}>
                <td role="cell">{two(i + 1)}</td>
                <th role="rowheader" scope="row">
                  <span>
                    {p.title}
                    <small>{t(p.description)}</small>
                  </span>
                  <img className="index__thumb" src={image(p, 640)} width={640} height={400} loading="lazy" decoding="async" alt="" />
                </th>
                <td role="cell" className="index__kind">
                  {t(ui.work.kinds[p.kind])}
                </td>
                <td role="cell" className="index__stack">
                  {p.stack.join(', ')}
                </td>
                <td role="cell">
                  <ProjectLinks project={p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="index__preview" ref={preview} data-visible={hovered !== null || undefined} aria-hidden="true">
          {hovered && <img src={image(hovered, 640)} width={640} height={400} alt="" />}
        </div>
      </div>
    </section>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  const { t } = useLanguage();
  if (!project.live && !project.source) {
    return (
      <p className="links links--none">
        <span aria-hidden="true">—</span>
        <span className="visually-hidden">{t(ui.work.noLinks)}</span>
      </p>
    );
  }
  return (
    <p className="links">
      {project.live && (
        <a className="link" href={project.live} target="_blank" rel="noreferrer">
          {t(ui.work.live)}
          <span className="visually-hidden">: {project.title}</span>
        </a>
      )}
      {project.source && (
        <a className="link" href={project.source} target="_blank" rel="noreferrer">
          {t(ui.work.source)}
          <span className="visually-hidden">: {project.title}</span>
        </a>
      )}
    </p>
  );
}
