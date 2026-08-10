import { CATENA_X_LABEL_ASSET } from '../../constants/catenaXStatus';

function renderLabelText(label) {
  return <span className="credential-strip__label">{label}</span>;
}

/*
  Official Catena-X Qualified Advisor label. Legal/lifecycle:
  render the official file only, unmodified and aspect-preserved
  (never crop its clear-space, never object-fit: cover). The
  usage right expires 2027-07-06 — renew before then, or remove
  on lapse by setting CATENA_X_LABEL_ASSET to null (this
  component then falls back to plain text inside the same link).
  This is the only linkable credential, and only to catena-x.net.
*/
function renderCatenaXAsset(label) {
  if (!CATENA_X_LABEL_ASSET) {
    return renderLabelText(label);
  }
  return (
    <img
      alt="Catena-X Qualified Advisor"
      src={CATENA_X_LABEL_ASSET}
      loading="lazy"
      decoding="async"
      className="credential-strip__label-img"
    />
  );
}

export default function CredentialLabel({ label, isCatenaXLabel, href }) {
  if (isCatenaXLabel) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {renderCatenaXAsset(label)}
      </a>
    );
  }
  return renderLabelText(label);
}
