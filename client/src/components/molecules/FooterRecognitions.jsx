import { CREDENTIALS } from '../../constants/credentials';
import {
  CATENA_X_LABEL_ASSET,
  CATENA_X_LABEL_ASSET_NEG,
} from '../../constants/catenaXStatus';

/*
  Catena-X Qualified Advisor label on the dark footer, in three states
  evaluated in this order:

  1. A negative (dark-surface) variant exists — render it bare; the dark
     footer is already the ground its original design expects.
  2. Only the positive variant exists (today) — render it unmodified
     inside a white plaque. "All labels are to be used in their original
     design only": the plaque supplies the light ground the file was
     drawn for and is not a modification of the file. Never invert,
     tint, recolour or fade the image, never crop the clear space baked
     into it, and never object-fit: cover it.
  3. Neither constant is set — fall back to the plain label text.

  Lifecycle: the usage right must be renewed by 2027-07-06, and Logo Use
  Agreement §6.1 allows revocation with immediate effect. On lapse or
  revocation, set the constant in catenaXStatus.js to null — this falls
  through to text with no other code change.
*/
function renderCatenaXLabel(label) {
  if (CATENA_X_LABEL_ASSET_NEG) {
    return (
      <img
        alt={label}
        src={CATENA_X_LABEL_ASSET_NEG}
        loading="lazy"
        decoding="async"
        className="footer-label-img"
      />
    );
  }
  if (CATENA_X_LABEL_ASSET) {
    return (
      <span className="footer-label-plaque">
        <img
          alt={label}
          src={CATENA_X_LABEL_ASSET}
          loading="lazy"
          decoding="async"
          className="footer-label-img"
        />
      </span>
    );
  }
  return label;
}

export default function FooterRecognitions() {
  /* Test ids are prefixed `footer-recognition-`, not `credential-`:
     CREDENTIALS renders twice on `/` (CredentialStrip and this block),
     and duplicate test ids would break getByTestId in both suites. */
  return (
    <div data-testid="footer-recognitions">
      <h6 className="footer-heading">Recognitions</h6>
      {CREDENTIALS.map(({ id, label, note, isCatenaXLabel }) =>
        isCatenaXLabel ? (
          <div
            className="footer-recognition"
            data-testid={`footer-recognition-${id}`}
            key={id}
          >
            {renderCatenaXLabel(label)}
            <p className="footer-text small mb-1">{note}</p>
          </div>
        ) : (
          <p
            className="footer-text small mb-1"
            data-testid={`footer-recognition-${id}`}
            key={id}
          >
            {label}
            {' — '}
            {note}
          </p>
        ),
      )}
    </div>
  );
}
