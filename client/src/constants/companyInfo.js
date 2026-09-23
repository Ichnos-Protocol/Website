export const COMPANY_INFO = {
  legalName: "Ichnos Protocol Pte. Ltd.",
  uen: "202606052196",
  registeredAddress:
    "160 Robinson Road, #14-04 Singapore Business Federation Centre, Singapore 068914",
  // Positioning line (Francesco, 2026-08-12). Single source for the footer
  // brand column, the schema.org organization description opening, and the
  // default og:image alt.
  tagline: "Battery and EU battery passport advisory for ASEAN.",
};

export const CONTACT_INFO = {
  email: "francesco@ichnos-protocol.com",
  linkedInCompany: "https://www.linkedin.com/company/ichnos-protocol/",
  linkedInFounder: "https://www.linkedin.com/in/maltonif/",
  calendly: "https://calendly.com/maltonif",
};

// Booking link imported by the readiness-assessment CTAs. Transitional: it
// currently aliases the existing Calendly schedule so the URL appears once.
// The footer and the contact section still read CONTACT_INFO.calendly
// directly. The vendor flip, and the collapse of every booking CTA onto this
// one constant, happen in the migration commit. Never append query
// parameters to it.
export const BOOKING_URL = CONTACT_INFO.calendly;

export const CONTACT_SECTION_CONTENT = {
  heading: "Get in touch",
  subhead:
    "Tell us about your project — chat with us directly, book a call, or send a message.",
  links: {
    linkedInCompany: "LinkedIn (Company)",
    linkedInFounder: "LinkedIn (Founder)",
    bookCall: "Book a Call",
  },
  addressLine:
    "Ichnos Protocol Pte. Ltd. — 160 Robinson Road, #14-04 Singapore Business Federation Centre, Singapore 068914 · UEN 202606052196",
};
