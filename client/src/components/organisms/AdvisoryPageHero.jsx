export default function AdvisoryPageHero({ eyebrow, title, subtitle }) {
  return (
    <header className="advisory-page-hero full-bleed-section">
      {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
      <h1 className="page-title">{title}</h1>
      <p className="lead section-subtext">{subtitle}</p>
    </header>
  );
}
