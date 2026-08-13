import { CX_LABEL_ASSETS } from '../../constants/catenaXStatus';

function renderLabelText(label) {
  return <span className="credential-strip__label">{label}</span>;
}

const LABEL_SIZE_MODIFIERS = { advisor: '--advisor', member: '--member' };

// Pure: both official marks carry a sizing modifier. The 16:9 advisor SVG
// bakes in ~54% clear space while the member SVG is tight-cropped, so an
// equal `height` renders them at unequal optical size; the modifiers
// equalise the visible mark height (source §5.2). Keyed on cxLabel only —
// never on the asset filename. Unknown values get the bare base class.
function composeImgClass(cxLabel) {
  const base = 'credential-strip__label-img';
  const suffix = LABEL_SIZE_MODIFIERS[cxLabel];
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
function resolveLabelAsset(label, cxLabel) {
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
      className={composeImgClass(cxLabel)}
    />
  );
}

export default function CredentialLabel({ label, cxLabel, href }) {
  const content = resolveLabelAsset(label, cxLabel) ?? renderLabelText(label);
  if (!href) {
    return content;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  );
}
