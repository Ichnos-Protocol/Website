import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';

const MENUS = [
  {
    heading: 'Company',
    testId: 'footer-col-company',
    links: [
      {
        label: 'Why Ichnos',
        to: '/',
        state: { scrollTo: 'company' },
      },
      { label: 'Team', to: '/team' },
    ],
  },
  {
    heading: 'Services',
    testId: 'footer-col-services',
    links: [
      {
        label: 'Engineering',
        to: '/services',
        state: { scrollTo: 'engineering' },
      },
      {
        label: 'Catena-X services',
        to: '/services',
        state: { scrollTo: 'catena-x' },
      },
      {
        label: 'Compliance',
        to: '/services',
        state: { scrollTo: 'compliance' },
      },
      {
        label: 'Circularity',
        to: '/services',
        state: { scrollTo: 'circularity' },
      },
    ],
  },
  {
    heading: 'Products',
    testId: 'footer-col-products',
    links: [
      { label: 'Battery Passport', to: '/passport' },
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
