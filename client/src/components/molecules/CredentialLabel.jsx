import { CX_LABEL_ASSETS } from '../../constants/catenaXStatus';

function renderLabelText(label) {
  return <span className="credential-strip__label">{label}</span>;
}

const LABEL_SIZE_MODIFIERS = { member: '--member' };

const VARIANT_BASE_CLASSES = {
  strip: 'credential-strip__label-img',
  profile: 'founder-credential-label',
};

// Pure: the variant selects the base class. Only the strip base carries a
// sizing modifier — the tight-cropped member SVG needs clear space added
// around it (source §5.2). Keyed on cxLabel only, never on the asset
// filename. Unknown values get the bare base class.
function composeImgClass(cxLabel, variant) {
  const base = VARIANT_BASE_CLASSES[variant] ?? VARIANT_BASE_CLASSES.strip;
  const suffix = variant === 'strip' ? LABEL_SIZE_MODIFIERS[cxLabel] : null;
  return suffix ? `${base} ${base}${suffix}` : base;
}

/*
  Official Catena-X labels (Qualified Advisor and Association member).
  Legal/lifecycle: render the official files only, unmodified and
  aspect-preserved (never crop their clear space, never object-fit:
  cover). The advisor usage right expires 2027-07-06 and the member
  right runs with ordinary membership — on lapse or revocation, set the
  matching constant in catenaXStatus.js to null and this falls back to
  plain text. Linking is driven entirely by the credential's `href`:
  only catena-x.net may carry it, and only one label per page.
*/
function resolveLabelAsset(label, cxLabel, variant) {
  const pos = CX_LABEL_ASSETS[cxLabel]?.pos;
  if (!pos) {
    return null;
  }
  return (
    <img
      alt={label}
      src={pos}
      loading="lazy"
      decoding="async"
      className={composeImgClass(cxLabel, variant)}
    />
  );
}

export default function CredentialLabel({
  label,
  cxLabel,
  href,
  variant = 'strip',
}) {
  const content =
    resolveLabelAsset(label, cxLabel, variant) ?? renderLabelText(label);
  if (!href) {
    return content;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  );
}
