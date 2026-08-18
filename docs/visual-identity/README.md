# Ichnos Protocol — Visual Identity Kit

Everything needed to make the Catena-X Battery Passport demo look like it came from the Ichnos Protocol website.

Every value in this folder was extracted from the live site, not invented for the handoff. The source of truth stays `client/src/index.css`, `client/index.html`, `client/public/brand/` and `client/src/constants/catenaXStatus.js`. If the site changes, this folder gets re-exported.

## Contents

| Path | What it is |
| --- | --- |
| `brand-guidelines.md` | The rules: colour, type, spacing, logo, layout, accessibility. Read this first. |
| `tokens/ichnos-tokens.css` | Copy-paste CSS custom properties. Load before anything else. |
| `tokens/ichnos-tokens.json` | The same values as JSON, for Figma, Tailwind config, or JS theming. |
| `components/ichnos-components.css` | The site's real component rules (cards, badges, timeline, chat, tables), class names unchanged. |
| `preview.html` | Open in a browser. Renders the whole palette, type scale and component set on one page. |
| `logos/ichnos/` | Ichnos mark, lockup and app icons in every sanctioned variant. |
| `logos/catena-x/` | Official Catena-X labels. **Legally constrained — read `logos/catena-x/USAGE.md` before touching these.** |
| `reference/logo_preview_sheet.png` | The mark rendered across sizes and backgrounds. |
| `reference/bg-advisory.jpg` | The hero photograph, with the overlay recipe in `brand-guidelines.md` §8. |

## Quickstart

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

<link rel="stylesheet" href="tokens/ichnos-tokens.css" />
<link rel="stylesheet" href="components/ichnos-components.css" />
```

Then build against the custom properties. Never hardcode a hex value in component code.

```css
.passport-header {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-bottom: 3px solid var(--color-accent-primary);
  padding: var(--spacing-lg) var(--spacing-md);
}
```

Bootstrap 5 is assumed for layout utilities (`container`, `row`, `col`, `py-5`, `mb-3`, `d-flex`). Nothing in `tokens/` needs it. A few rules in `components/` override Bootstrap defaults and are marked in place; drop those if the demo uses a different framework.

## The five things that matter most

1. **One blue.** `#0F71CB` is the only interactive colour. Every button, link, active state, focus ring and primary border uses it. Amber `#FFA600` and green `#B3CB2D` come from the logo and stay decorative.
2. **One typeface.** Libre Franklin, weights 300 to 700. Headings are 700 with `-0.02em` tracking. There is no second family.
3. **Light only.** The site has no dark mode. The single dark surface is the footer band, scoped as `.surface-dark`.
4. **4px spacing grid.** `--spacing-xs` through `--spacing-3xl`. Nothing sits at an off-grid value.
5. **The Catena-X labels are governed by a Logo Use Agreement.** They are not decoration. See `logos/catena-x/USAGE.md`.

## Copy rules that constrain the visuals

The website enforces a vocabulary guard in CI (`client/src/constants/vocabulary.js`). Some of it decides what a badge or a caption is allowed to say, so it applies to the demo too:

- Never write "Catena-X certified", "Catena-X Partner", "Catena-X Solution Partner", "powered by Catena-X", "Catena-X compatible/compliant/conformant", or "Catena-X Advisory Provider".
- The two sanctioned status strings are **"Catena-X Association ordinary member"** and **"Catena-X Qualified Advisor"** (Attestation ID 868).
- Never write "EU Battery Pass" when "EU Battery Passport" is meant.
- No blockchain vocabulary anywhere: no "blockchain", "on-chain", "web3", "NFT", "DeFi", "distributed ledger", "zero-knowledge", "ZKP". Trust rests on Verifiable Credentials presented via DCP.
- Casing of third-party marks is fixed. "Catena-X" and "Tractus-X" are never uppercased by CSS. This is why `.section-eyebrow` and `.pillar-subtitle` carry an explicit "no `text-transform`" rule.

The full trademark notice, required at the foot of any surface that shows a Catena-X label, is in `logos/catena-x/USAGE.md`.

## Questions

Anything ambiguous in here resolves against the live site at <https://ichnos-protocol.com>. If the site and this folder disagree, the site wins and this folder needs re-exporting.
