import { CREDENTIALS } from '../../constants/credentials';
import { CX_LABEL_ASSETS } from '../../constants/catenaXStatus';

const LABEL_SIZE_MODIFIERS = { advisor: '--advisor', member: '--member' };

// Pure: both official marks carry a sizing modifier. The 16:9 advisor SVG
// bakes in ~54% clear space while the member SVG is tight-cropped, so an
// equal `height` renders them at unequal optical size; the modifiers
// equalise the visible mark height (source §5.2). Keyed on cxLabel only —
// never on the asset filename. Unknown values get the bare base class.
function composeImgClass(cxLabel) {
  const base = 'footer-label-img';
  const suffix = LABEL_SIZE_MODIFIERS[cxLabel];
  return suffix ? `${base} ${base}${suffix}` : base;
}

/*
  Official Catena-X labels (Qualified Advisor and Association member) on
  the dark footer, in three states evaluated in this order, per label:

  1. A negative (dark-surface) variant exists — render it bare; the dark
     footer is already the ground its original design expects.
  2. Only the positive variant exists — render it unmodified inside a
     white plaque. "All labels are to be used in their original design
     only": the plaque supplies the light ground the file was drawn for
     and is not a modification of the file. Never invert, tint, recolour
     or fade the image, never crop the clear space baked into it, and
     never object-fit: cover it. Both negatives are supplied today, so
     this branch is dormant — dormant, not dead: nulling a negative
     brings the plaque straight back.
  3. Neither variant is set — fall back to the plain label text.

  Lifecycle: the advisor usage right must be renewed by 2027-07-06, the
  member right runs with ordinary membership, and Logo Use Agreement
  §6.1 allows revocation with immediate effect. On lapse or revocation,
  set the matching constant in catenaXStatus.js to null — this falls
  through with no other code change. The footer never links a label.
*/
function renderCatenaXLabel(cxLabel, label) {
  const assets = CX_LABEL_ASSETS[cxLabel];
  const src = assets?.neg ?? assets?.pos;
  if (!src) {
    return label;
  }
  const img = (
    <img
      alt={label}
      src={src}
      loading="lazy"
      decoding="async"
      className={composeImgClass(cxLabel)}
    />
  );
  if (assets.neg) {
    return img;
  }
  return <span className="footer-label-plaque">{img}</span>;
}

export default function FooterRecognitions() {
  /* Test ids are prefixed `footer-recognition-`, not `credential-`:
     CREDENTIALS renders twice on `/` (CredentialStrip and this block),
     and duplicate test ids would break getByTestId in both suites. */
  return (
    <div data-testid="footer-recognitions">
      <h6 className="footer-heading">Credentials</h6>
      {CREDENTIALS.map(({ id, label, note, cxLabel }) =>
        cxLabel ? (
          <div
            className="footer-recognition"
            data-testid={`footer-recognition-${id}`}
            key={id}
          >
            {renderCatenaXLabel(cxLabel, label)}
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
