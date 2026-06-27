import { useState } from 'react';

// Single source of truth — the transparent-background lockup works against any
// page background, so we point every theme key at the same file. The `theme`
// prop is retained as a stable API for future divergent variants.
const LOGO_SOURCES = {
  light: '/Ichnos-protocol_logo_transparent.png',
  dark: '/Ichnos-protocol_logo_transparent.png',
  advisory: '/Ichnos-protocol_logo_transparent.png',
  passport: '/Ichnos-protocol_logo_transparent.png',
};

export default function Logo({ className = '', theme = 'light' }) {
  const [failed, setFailed] = useState(false);
  const src = LOGO_SOURCES[theme] ?? LOGO_SOURCES.light;

  if (failed) {
    return (
      <span className={`fw-bold text-uppercase logo-fallback ${className}`}>
        ICHNOS PROTOCOL
      </span>
    );
  }

  return (
    <img
      src={src}
      alt="Ichnos Protocol"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
