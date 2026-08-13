import { useState } from 'react';

// Per-surface logo mapping. The wordmark must contrast with the surface it sits
// on: light surfaces get the dark wordmark, dark surfaces get the light one.
// `advisory`/`passport` are semantic aliases for the two surface tones, kept as
// a stable API so callers can name the context rather than the colour.
const LOGO_SOURCES = {
  light: '/brand/ichnos_mark_dualtone.svg',
  dark: '/brand/ichnos_mark_white.svg',
  advisory: '/brand/ichnos_mark_dualtone.svg',
  passport: '/brand/ichnos_mark_white.svg',
};

export default function Logo({
  className = '',
  theme = 'light',
  withWordmark = false,
}) {
  const [failed, setFailed] = useState(false);
  const src = LOGO_SOURCES[theme] ?? LOGO_SOURCES.light;

  if (failed) {
    return (
      <span className={`fw-bold text-uppercase logo-fallback ${className}`}>
        ICHNOS PROTOCOL
      </span>
    );
  }

  const mark = (
    <img
      src={src}
      alt="Ichnos Protocol"
      className={className}
      onError={() => setFailed(true)}
    />
  );

  if (!withWordmark) {
    return mark;
  }

  // The wordmark repeats the mark's alt text, so it is hidden from the
  // accessibility tree to keep a single accessible name. It is also hidden
  // below 576px, where only the mark fits.
  return (
    <span className="d-inline-flex align-items-center gap-2">
      {mark}
      <span
        data-testid="logo-wordmark"
        aria-hidden="true"
        className="d-none d-sm-inline"
      >
        <span className="fw-bold">Ichnos</span>{' '}
        <span className="fw-medium text-accent">Protocol</span>
      </span>
    </span>
  );
}
