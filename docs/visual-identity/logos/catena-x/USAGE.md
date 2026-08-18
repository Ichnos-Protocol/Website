# Official Catena-X Labels — Usage Rules

**Read this before rendering any file in this folder.**

These are not brand assets in the ordinary sense. They are official labels licensed under a Logo Use Agreement with Catena-X Automotive Network e.V., revocable **with immediate effect and no notice** (Logo Use Agreement §6.1). Misuse is a legal exposure for Ichnos Protocol, not a design inconsistency.

If you are unsure whether a placement is allowed, do not ship it. Ask first.

---

## 1. What Ichnos holds

Two credentials, two independent lifecycles. They must never be treated as one status.

| Credential | Sanctioned wording | Lifecycle |
| --- | --- | --- |
| Association membership | "Catena-X Association ordinary member" (short form: "Catena-X Association member") | Ongoing, terminable on 3 months' notice to fiscal-year end |
| Qualified Advisor | "Catena-X Qualified Advisor", Attestation ID 868 | Renew by **2027-07-06** |

A third, unlabelled participation exists and carries no logo: member of the Digital Product Passport Expert Group under the Catena-X Sustainability Committee.

**Never write** "Catena-X certified", "Catena-X Partner", "Catena-X Solution Partner", "official Catena-X partner", "powered by Catena-X", "Catena-X compatible / compliant / conformant", or "Catena-X Advisory Provider". These are enforced by a CI vocabulary guard on the website and the same rule applies to the demo.

---

## 2. Files

| File | Credential | Variant | Use |
| --- | --- | --- | --- |
| `Association_member_Logo_RGB_pos.svg` | Membership | Positive | Light surfaces |
| `Association_member_Logo_RGB_neg.svg` | Membership | Negative | Dark surfaces |
| `CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9.svg` | Advisor | Positive, official 16:9 delivery | Archive master |
| `CX_Logo_Qualified-Advisor_CLR_RGB_pos_cropped.svg` | Advisor | Positive, viewBox-trimmed | **Display file** |
| `CX_Logo_Qualified-Advisor_RGB_neg_16x9.svg` | Advisor | Negative, official 16:9 delivery | Archive master |
| `CX_Logo_Qualified-Advisor_RGB_neg_cropped.svg` | Advisor | Negative, viewBox-trimmed | **Display file** |

The `_cropped` files are viewBox-trimmed derivatives of the official 16:9 deliveries. **The artwork is byte-identical**; only the empty canvas around it was trimmed, because the 16:9 canvas rendered the label illegible at card scale. The mandated clear space is re-supplied as CSS padding (§4). Keep the `_16x9` masters in the repo as the record of what was officially delivered.

The member file is already tight-cropped as delivered (viewBox `0 0 1497.1 384`, roughly 3.9:1, zero built-in margin).

---

## 3. Hard rules

1. **One linked label per page, maximum.** A label may link only to `https://catena-x.net`. On the website that one link is the Qualified Advisor label; no other credential carries an `href`. Apply the same discipline in the demo.
2. **Never crop, recolour, rotate, distort, or overlay a label.** Aspect ratio is preserved with `object-fit: contain`.
3. **Positive files need a light ground.** On a dark surface, use the `_neg` file. If only the positive file is available, put it on a white plaque (`.cx-label-plaque`, 4px radius, 6px/10px padding). The negative file is always preferred over the plaque.
4. **Clear space** for the member label is the height of the figurative mark on every side. Padding adds space around the mark and never crops it.
5. **Alt text is the credential label**, for example `alt="Catena-X Qualified Advisor"`. The image never becomes a second source of truth for the wording.
6. **The trademark notice (§5) must appear** on any page that shows a label.
7. **If a credential lapses or the licence is revoked, the label comes down immediately.** On the website this is a one-line change: set the asset constant to `null` in `client/src/constants/catenaXStatus.js` and the image disappears everywhere with a text fallback. Build the demo so the same removal is one edit.

---

## 4. Sizing: font parity, not box parity

This is the part most likely to be got wrong.

Naively matching the two labels' bounding-box heights leaves the advisor wordmark at roughly two thirds the member's, and the "Qualified Advisor" line becomes illegible. Sizing is therefore driven by the **"Catena-X" wordmark**, not the canvas.

Measured wordmark fractions of canvas height:

- Member label: **0.478**
- Cropped advisor label: **0.318**

So the advisor label needs **1.5x** the member label's declared height for the two wordmarks to render at the same size. That ratio is normative. The pixel values below are tunable by ±15%.

| Context | Member height | Advisor height | Resulting wordmark |
| --- | --- | --- | --- |
| Credential card | 40px | 60px | ≈19px both |
| Footer | 36px | 54px | ≈17px both |

```css
.cx-label-img {
  height: 40px;
  width: auto;
  object-fit: contain;
  display: block;
}

.cx-label-img--advisor {
  box-sizing: content-box;
  height: 60px;      /* 1.5 x the member height */
  padding: 20px 8px; /* clear space; the cropped file has no baked margin */
}

.cx-label-img--member {
  box-sizing: content-box;
  height: 40px;
  padding: 30px 12px; /* vertical ≈ 0.75 x the visible height */
}
```

**`box-sizing: content-box` is mandatory.** Bootstrap Reboot sets a global `border-box`, which would subtract the clear-space padding from the declared height and shrink the mark below its permitted minimum size. This is a licence issue, not a layout preference.

---

## 5. Required trademark notice

Reproduce this string exactly. It is a tier-3 exact-match string on the website, scanned in CI. Do not shorten it, do not split it into concatenated fragments, and do not reword the final sentence, which is the load-bearing disclaimer.

> Catena-X® is a registered trademark of Catena-X Automotive Network e.V. Ichnos Protocol Pte. Ltd. is an ordinary member of the association and a Catena-X Qualified Advisor. References to Catena-X standards and committees describe factual participation and do not imply certification of Ichnos products or endorsement by the association or its bodies.

On the website it renders at 11px in `--color-text-secondary`, centred, above a hairline, at the foot of the page (`.footer-attribution`).

---

## 6. Casing

"Catena-X" and "Tractus-X" render with that exact casing, always. CSS must never apply `text-transform` to an element that can contain either mark. On the website this is why `.section-eyebrow` and `.pillar-subtitle` carry an explicit no-transform rule, and why the uppercase `.pillar-badge` and `.footer-heading` are only used for text that never contains a third-party mark.
