import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";

import {
  ROUTE_CONSORTIUM,
  ROUTE_LANDING,
  ROUTE_PASSPORT,
  ROUTE_READINESS_ASSESSMENT,
  ROUTE_SERVICES,
  ROUTE_TEAM,
} from "../../constants/routes";

const MENUS = [
  {
    heading: "Company",
    testId: "footer-col-company",
    links: [
      {
        label: "Why Ichnos",
        to: ROUTE_LANDING,
        state: { scrollTo: "company" },
      },
      { label: "Team", to: ROUTE_TEAM },
    ],
  },
  {
    heading: "Services",
    testId: "footer-col-services",
    links: [
      {
        label: "Engineering",
        to: ROUTE_SERVICES,
        state: { scrollTo: "engineering" },
      },
      {
        label: "Catena-X services",
        to: ROUTE_SERVICES,
        state: { scrollTo: "catena-x" },
      },
      {
        label: "Compliance",
        to: ROUTE_SERVICES,
        state: { scrollTo: "compliance" },
      },
      {
        label: "Circularity",
        to: ROUTE_SERVICES,
        state: { scrollTo: "circularity" },
      },
    ],
  },
  {
    heading: "Products",
    testId: "footer-col-products",
    links: [
      // First by owner decision 2026-09-23: the assessment is the offer with
      // a price behind it, and the footer is one of its five entry points.
      { label: "Readiness Assessment", to: ROUTE_READINESS_ASSESSMENT },
      { label: "Battery Passport", to: ROUTE_PASSPORT },
      { label: "Consortium", to: ROUTE_CONSORTIUM },
    ],
  },
];

export default function FooterNavColumns() {
  return (
    <>
      {MENUS.map(({ heading, testId, links }) => (
        <Col xs={12} sm={6} lg={2} key={heading} data-testid={testId}>
          <h6 className="footer-heading">{heading}</h6>
          {links.map(({ label, to, state }) => (
            <Link
              key={label}
              to={to}
              state={state}
              className="footer-link d-block"
            >
              {label}
            </Link>
          ))}
        </Col>
      ))}
    </>
  );
}
