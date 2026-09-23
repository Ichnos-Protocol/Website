import BsBreadcrumb from 'react-bootstrap/Breadcrumb';
import { Link } from 'react-router-dom';

import { ROUTE_PASSPORT } from '../../constants/routes';

// react-bootstrap's Breadcrumb is aliased because this component takes the
// same name, on the `Button as BsButton` precedent in atoms/Button.jsx.
const PARENT_LABEL = 'Battery passport';
const CURRENT_LABEL = 'Data readiness assessment';

// linkAs={Link} keeps the parent crumb a client-side navigation instead of a
// full page load, and routes the destination through ROUTE_PASSPORT rather
// than a written-out path, which the route guard in constants/routes.js
// forbids outside that module. The active crumb is plain text, not a link;
// react-bootstrap emits aria-current="page" for it.
export default function Breadcrumb() {
  return (
    <BsBreadcrumb className="mb-0" data-testid="assessment-breadcrumb">
      <BsBreadcrumb.Item
        linkAs={Link}
        linkProps={{
          to: ROUTE_PASSPORT,
          'data-testid': 'assessment-breadcrumb-parent',
        }}
      >
        {PARENT_LABEL}
      </BsBreadcrumb.Item>
      <BsBreadcrumb.Item active>{CURRENT_LABEL}</BsBreadcrumb.Item>
    </BsBreadcrumb>
  );
}
