import {
  CATENA_X_QUALIFICATION_GRANTED,
  CATENA_X_QUALIFIER_CLASS,
  getCatenaXQualifierText,
} from '../../constants/catenaXStatus';

// React node version of the Catena-X qualifier, for any visual surface
// that should gray the qualifier — wraps it in a span carrying
// CATENA_X_QUALIFIER_CLASS. Returns null when the qualification is
// granted so the surrounding JSX renders nothing extra. The display
// text is derived from getCatenaXQualifierText() so the literal lives
// in a single source of truth.
export default function CatenaXQualifierSpan() {
  if (CATENA_X_QUALIFICATION_GRANTED) return null;
  return (
    <span className={CATENA_X_QUALIFIER_CLASS}>{getCatenaXQualifierText()}</span>
  );
}
