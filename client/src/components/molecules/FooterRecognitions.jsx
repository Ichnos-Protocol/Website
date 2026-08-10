import { CREDENTIALS } from '../../constants/credentials';
import { CATENA_X_LABEL_ASSET_NEG } from '../../constants/catenaXStatus';

function renderRecognitionLabel(label, isCatenaXLabel) {
  /* Footer stays dark: only the negative/dark label variant
     may ever render here. While CATENA_X_LABEL_ASSET_NEG is
     null, all recognitions are text-only — never the pos
     asset, never an inverted image. */
  if (isCatenaXLabel && CATENA_X_LABEL_ASSET_NEG) {
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
  return label;
}

export default function FooterRecognitions() {
  return (
    <div data-testid="footer-recognitions">
      <h6 className="footer-heading">Recognitions</h6>
      {CREDENTIALS.map(({ id, label, note, isCatenaXLabel }) => (
        <p className="footer-text small mb-1" key={id}>
          {renderRecognitionLabel(label, isCatenaXLabel)}
          {' — '}
          {note}
        </p>
      ))}
    </div>
  );
}
