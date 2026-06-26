export const SERVICES_PAGE_CONTENT = {
  title: "Services",
  subtitle:
    "Catena-X-compatible data services from materials to modules, Catena-X consulting for ASEAN onboarding, and battery-systems advisory for European buyers operating in ASEAN.",
};

// Three §5.2 sections rendered on /services, in order:
//   A — Upstream data services (flagship; links to /data)
//   B — Catena-X consulting teaser (links to /catena-x)
//   C — Engineering advisory
export const SERVICES_SECTIONS = [
  {
    id: "data-services",
    label: "Upstream data services for the Catena-X passport ecosystem",
    items: [
      {
        id: "material-composition-data",
        title:
          "Material, electrode, cell, module & pack data — Catena-X-compatible.",
        description:
          "Source-level data across the ASEAN chain — materials, precursors (pCAM/CAM), electrodes, cells, modules: chemistry; composition by mass percentage of cobalt, lithium, nickel, lead; manufacturer identity under ISO/IEC 15459; manufacturing site; batch; agreed process parameters. The canonical Annex XIII data set, delivered via Eclipse Dataspace Connector (EDC) into your passport stack — passport-ready for the EU importer.",
      },
      {
        id: "carbon-footprint-data",
        title: "Site-level carbon footprint data — EU-methodology-compliant.",
        description:
          "Per-model, per-site, per-batch carbon footprint on the actual site grid mix, real process energy, and raw-materials transport, calculated under the EU's harmonised rules for EV batteries (Article 7 / Annex II, JRC CFB-EV, the delegated act, building on the EU PEF method). Real numbers from real sites. Ties to the manufacturer's / importer's Article 7 declaration.",
      },
      {
        id: "due-diligence-esg-data",
        title:
          "Due-diligence and ESG data — OECD- and CSDDD-aligned, on-site verified.",
        description:
          "Site indicators on labour, environmental management, and provenance traceability of cobalt, lithium, natural graphite, nickel. Site verification by our team. Ties to Articles 47–53 / Annex XIV under EU 2023/1542 and to the CSDDD (EU 2024/1760).",
      },
      {
        id: "optional-quality-data",
        title: "Optional: quality data.",
        description:
          "Where the EU importer or OEM wants more than the regulatory minimum — incoming-quality and supplier-quality indicators captured at source alongside the passport data.",
      },
    ],
    cta: { label: "Explore data services →", to: "/data" },
  },
  {
    id: "catena-x-consulting",
    label: "Catena-X consulting (ASEAN onboarding)",
    teaser:
      "We guide ASEAN manufacturers and their European partners through Catena-X: data readiness, the onboarding steps, business cases, use-case and Tractus-X implementation, bilateral data relationships, release-driven technical change, and the regulatory requirements behind it all. Catena-X consultant qualification: application in progress.",
    cta: { label: "Catena-X consulting →", to: "/catena-x" },
  },
  {
    id: "engineering-advisory",
    label: "Engineering advisory for European buyers operating in ASEAN",
    items: [
      {
        id: "supplier-diligence-qualification",
        title: "Supplier diligence and qualification (ASEAN).",
        description:
          "On-the-ground site visits, qualification reports, process reviews, and qualification-test witnessing across Indonesia, Malaysia, Thailand, Vietnam.",
      },
      {
        id: "regulatory-readiness-liaison",
        title: "Regulatory readiness and supply-chain liaison.",
        description:
          "EU 2023/1542, MS 2818, TKDN, and ASEAN certification briefings; liaison with MARii, SIRIM, BKPM, KEMENPERIN; quarterly briefings and on-call retainer.",
      },
      {
        id: "system-architecture-expert-witness",
        title: "System architecture, project management, and expert witness.",
        description:
          "Battery-systems engineering from the FEV practice — architecture, BMS, cybersecurity, second-life; named subcontractor and expert witness for EU–ASEAN battery transactions.",
      },
    ],
  },
];
