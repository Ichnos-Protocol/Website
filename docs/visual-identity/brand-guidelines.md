# Ichnos Protocol — Brand Guidelines

Scope: the Catena-X Battery Passport demo. Source of truth: the live website.

---

## 1. Colour

### 1.1 Light palette (the default and, for the demo, the only theme)

| Token | Hex | Role |
| --- | --- | --- |
| `--color-bg-base` | `#FAFBFC` | Page ground. Also the browser `theme-color` and PWA background. |
| `--color-bg-alt` | `#EAF1FE` | Alternating band, tinted surface, bot chat bubble. |
| `--color-surface` | `#FFFFFF` | Cards, panels, navbar, table body. |
| `--color-text-primary` | `#111111` | Headings and body ink. |
| `--color-text-secondary` | `#252525` | Supporting copy, notes, captions, table cells. |
| `--color-accent-primary` | `#0F71CB` | The Catena-X blue. Every interactive element. |
| `--color-accent-cyan` | `#0F71CB` | Legacy alias, identical value. Prefer `--color-accent-primary` in new code. |
| `--color-accent-warm` | `#FFA600` | Logo amber. Decorative only. |
| `--color-accent-green` | `#B3CB2D` | Logo green. Decorative only. |
| `--color-border` | `#DCDCDC` | Neutral hairline. |
| `--color-shadow` | `rgba(15, 20, 25, 0.06)` | The only shadow colour. |

`--color-accent-cyan` is a historical name with no cyan in it. Both accent tokens resolve to the same blue, so a substitution is never visible, but new work should say `--color-accent-primary`.

### 1.2 Dark surface

The site has no dark mode. It has one dark band, the footer. In the kit this is `.surface-dark`.

| Token | Hex |
| --- | --- |
| `--color-bg-base` | `#0F1419` |
| `--color-bg-alt` / `--color-surface` | `#1A2030` |
| `--color-text-primary` | `#E8ECF1` |
| `--color-text-secondary` | `#9AA5B8` |
| `--color-border` | `rgba(232, 236, 241, 0.08)` |

Do not introduce a dark mode toggle in the demo. If a dark panel is needed, scope `.surface-dark` to that panel.

### 1.3 Rules

- **Blue is the only interactive colour.** Buttons, links, active nav items, focus rings, primary borders, the credential-card top rule, the table header underline, the user chat bubble, the avatar circle. All `#0F71CB`.
- **Amber and green never carry meaning.** They are the logo's own fills. Amber appears once outside the logo, as the `service-card` hover border, and once as a badge tint. Green appears only in the mark.
- **Amber is never text.** `#FFA600` on white is roughly 1.9:1. On the `badge-status-updating` chip the fill is amber at 15% and the label stays `--color-text-secondary`.
- **Card hairlines use `rgba(139, 157, 195, 0.15)`**, not `--color-border`. That cooler blue-grey is deliberate and appears across every card, table border and modal divider. The 0.25 variant is for form-control borders.

### 1.4 Status tints

Tint fill, readable ink. The pairing is fixed.

| Class | Fill | Text |
| --- | --- | --- |
| `.badge-status-live` | `rgba(15, 113, 203, 0.12)` | `--color-accent-primary` |
| `.badge-status-dev` | `rgba(15, 113, 203, 0.15)` | `--color-accent-primary` |
| `.badge-status-planned` | `rgba(139, 157, 195, 0.15)` | `--color-text-secondary` |
| `.badge-status-updating` | `rgba(255, 165, 0, 0.15)` | `--color-text-secondary` |

---

## 2. Typography

### 2.1 Family

**Libre Franklin** for everything. Weights 300, 400, 500, 600, 700, loaded from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

Fallback stack: `-apple-system, 'Segoe UI', Roboto, sans-serif`.

`--font-display` and `--font-sans` are the same family today. The separate token exists so a display face can be swapped in later without touching component code. Keep referencing both by their role.

`--font-mono` is declared as `'JetBrains Mono', monospace` but **the site never loads it**. A passport demo will want monospace for serial numbers, DIDs and hashes, so load JetBrains Mono yourself if you use the token; otherwise it falls back to the system monospace, which is acceptable.

### 2.2 Scale

| Token | Size |
| --- | --- |
| `--font-size-sm` | 14px |
| `--font-size-base` | 16px |
| `--font-size-lg` | 18px |
| `--font-size-xl` | 24px |
| `--font-size-2xl` | 32px |
| `--font-size-3xl` | 48px |

Line heights: `--line-height-tight` 1.2, `--line-height-normal` 1.5 (body default), `--line-height-relaxed` 1.75 (long bios and quotes).

### 2.3 Roles

| Role | Class | Treatment |
| --- | --- | --- |
| Page title | `.page-title` | 700, `letter-spacing: -0.02em` |
| Hero headline / display heading | `.hero-headline`, `.section-display-heading` | 700, `-0.02em` |
| Section heading | `.section-heading` | 600, normal tracking |
| Body | (default) | 400, 16px, 1.5 |
| Supporting copy | `.section-subtext`, `.text-muted-custom` | 400, `--color-text-secondary` |
| Eyebrow | `.section-eyebrow` | 0.8rem, `+0.06em`, secondary ink |
| Hero eyebrow | `.section-eyebrow--hero` | 0.9rem, weight 500 |
| Badge label | `.pillar-badge` | 0.6875rem, 600, `+0.05em`, uppercase |
| Footer heading | `.footer-heading` | 14px, 600, uppercase, `+0.06em` |
| Legal / disclaimer | `.footer-attribution` | 11px, secondary ink |

Negative tracking on the two heading roles is the identity's most recognisable typographic move. Keep it.

### 2.4 The uppercase rule

`.section-eyebrow` and `.pillar-subtitle` must never take `text-transform`, in the base rule or in any modifier. They carry third-party marks whose casing is fixed. "Catena-X" and "Tractus-X" are the exact renderings, and CSS is not allowed to rewrite them. `.pillar-badge` and `.footer-heading` *are* uppercase, and neither ever carries a third-party mark.

---

## 3. Spacing, radius, elevation

### 3.1 Spacing

4px grid: 4, 8, 16, 24, 32, 48, 64. Nothing sits off-grid. Section vertical rhythm is `py-5` (48px, Bootstrap's spacing 5) or `--spacing-3xl` for heroes.

### 3.2 Radius

| Value | Used for |
| --- | --- |
| 4px | Badges, credential cards, diagrams, the Catena-X plaque, chat bubble tails |
| 8px | Buttons, service cards |
| 12px | Elevated cards, chat panel, chat bubbles |
| 50% / 9999px | Avatars, icon circles, timeline dots, the chat input pill |

### 3.3 Elevation

One shadow colour and two steps.

```css
box-shadow: 0 2px 12px var(--color-shadow);  /* resting */
box-shadow: 0 8px 24px var(--color-shadow);  /* hover */
```

A card is either a hairline card or an elevated card, never both. Hover on an interactive card lifts it `translateY(-4px)` and recolours the border to the accent. Buttons lift `-2px`.

### 3.4 Motion

150ms for micro-interactions, 300ms for everything else, 500ms reserved. All `ease-in-out`. `prefers-reduced-motion: reduce` collapses every duration to 0.01ms and is included in the token file. Do not remove it.

---

## 4. Logo

### 4.1 Files

All in `logos/ichnos/`.

| File | Use |
| --- | --- |
| `ichnos_mark_dualtone.svg` | **Default.** Mark on light surfaces. Amber trunk, green canopy. |
| `ichnos_mark_white.svg` | Mark on dark surfaces and over photography. |
| `ichnos_mark_black.svg` | Single-colour light-surface use where dualtone is unavailable. |
| `ichnos_mark_mono_blue.svg` | Single-colour blue (`#0F71CB`) use. |
| `ichnos_lockup_dualtone.svg` | Mark plus wordmark, light surfaces. |
| `ichnos_lockup_white.svg` | Lockup, dark surfaces. Used in the site footer. |
| `ichnos_lockup_black.svg` | Lockup, single-colour light. |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon-180.png`, `icon-512.png` | Browser and app icons. |

The mark is a tree: `#FFA600` trunk, `#B3CB2D` canopy. Both groups are class-named (`.trunk`, `.canopy`) inside the SVG, so they can be restyled in place if a one-off treatment is ever needed. Do not do this without asking.

### 4.2 Sizing

Every file is tight-cropped to the artwork with no baked margin, so declared height equals visible height.

- Header mark: **38px**. The site does not go above this without re-checking narrow viewports.
- Footer lockup: **64px**.
- Minimum legible mark: **24px**. Below that, use the favicon.

### 4.3 Rules

- Pick the variant by surface contrast: light surface takes dualtone, dark surface takes white. Never place the dualtone mark on a dark ground.
- Clear space around the mark is its own trunk width on every side.
- Never recolour, rotate, skew, add a shadow, or place the mark inside a coloured chip.
- The mark carries `aria-label="Ichnos Protocol"`. When rendering as `<img>`, use `alt="Ichnos Protocol"`. If a text wordmark sits next to it, hide that text from the accessibility tree so the accessible name stays single.
- Text fallback when the SVG fails to load: `ICHNOS PROTOCOL`, bold, uppercase, in `--color-text-primary`.

`reference/logo_preview_sheet.png` shows the mark across sizes and grounds.

---

## 5. Layout

- Container max width **1140px**, Bootstrap default.
- Bootstrap 5 breakpoints. The site's own responsive checkpoints are **390px, 768px and 1440px**; test the demo at those three.
- Sections alternate `.section-rhythm-primary` (`#FAFBFC`) and `.section-rhythm-alt` (`#EAF1FE`). Two consecutive bands painting `--color-bg-alt` need at least `--spacing-xl` between them or they read as one band.
- **No horizontal scroll at any width.** Wide content scrolls inside its own container. Diagrams are width-relative, never pixel-sized.
- Grids pin their column count at tablet rather than relying on `auto-fit`, which fits three tracks into the 720px tablet container when two are wanted.

---

## 6. Components

Full CSS in `components/ichnos-components.css`; rendered examples in `preview.html`. The class names are the site's own, so anything built here transplants back without a rename.

| Pattern | Class | Note |
| --- | --- | --- |
| Hairline card | `.problem-card`, `.roadmap-card`, `.competency-card`, `.contact-card` | Default. 1px `rgba(139,157,195,0.15)`, accent border on hover. |
| Elevated card | `.card-elevated` | Shadow, no border, 12px radius. |
| Offering card | `.service-card` | 8px radius, amber hover border. `--lead` adds a 3px blue left rule; `--coming-soon` goes dashed and muted with no lift. |
| Credential card | `.credential-strip__item` | 3px blue top rule, 4px radius, 96px min height. |
| Status badge | `.badge-status-*` | Tint fill, readable ink. |
| Outline badge | `.pillar-badge` | `currentColor` border, transparent fill, uppercase. |
| Data table | `.table-dark-custom` | White body, `#FAFBFC` header, 2px blue underline on the header row. |
| Timeline | `.regulatory-timeline__*` | Vertical below 62rem, horizontal arrow axis above. One DOM, one media query. |
| Chat panel | `.chat-panel__*` | 12px radius panel, blue user bubble, tinted bot bubble, 40px circular send button. |
| Primary button | `.hero-cta-btn` | Blue fill, white label, 8px radius, `-2px` hover lift. |

### 6.1 The "coming soon" treatment

Dashed lower-contrast border, muted body text, muted icon, no hover lift. The desaturation plus the body copy is the entire signal. There is no ribbon graphic, no diagonal banner, no corner flag. Keep it that quiet.

---

## 7. Accessibility

- Body text meets AA. `#252525` on `#FAFBFC` is about 15:1; `#0F71CB` on white is about 4.6:1, which passes AA for normal text.
- **Photographic overlay alpha 0.66 is a floor.** If a contrast check fails over a photo, raise the alpha by at most 0.06 at a time and never past 0.85 / 0.95. Never lower it for a stronger image.
- Focus ring: `box-shadow: 0 0 0 0.2rem rgba(15, 113, 203, 0.25)` with the border recoloured to the accent. Never remove focus styling without replacing it.
- Interactive targets are at least 48px tall on mobile.
- Colour is never the only signal. Status badges carry a text label; the "coming soon" card carries body copy; the deferred timeline entry is dashed as well as greyed.
- `prefers-reduced-motion` is honoured globally.

---

## 8. Photography

`reference/bg-advisory.jpg` is the hero photograph. The footer photograph is not shipped in this kit: `client/public/bg-footer.jpg` on the website is a 6.4MB unoptimised JPEG, and copying it around would carry that weight into every consumer. Pull it from the website repo if the demo needs a photographic footer, and compress it first.

Photography is always behind a wash, never bare.

```css
/* Light hero */
background:
  linear-gradient(rgba(245, 247, 250, 0.66), rgba(232, 236, 241, 0.80)),
  url('bg-advisory.jpg') center / cover no-repeat;

/* Dark footer */
background:
  linear-gradient(rgba(15, 20, 25, 0.85), rgba(15, 20, 25, 0.92)),
  url('bg-footer.jpg') center / cover no-repeat;
```

Text over a photo carries no text-shadow. The wash does the work.

---

## 9. Catena-X marks

Governed by a Logo Use Agreement, with revocation on immediate notice. Read `logos/catena-x/USAGE.md` before rendering any of those files. The short version:

- At most **one** linked label per page, and it may link only to `catena-x.net`.
- Positive files need a light ground; on a dark surface use the `_neg` file, or a white plaque as fallback.
- Advisor label height is **1.5x** the member label height. That ratio is normative and equalises the two "Catena-X" wordmarks.
- `box-sizing: content-box` is mandatory on the label images.
- Never crop, recolour, or overlay a label.
- The trademark notice must appear on any page showing a label.
