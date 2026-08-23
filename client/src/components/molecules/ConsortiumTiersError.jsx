import { Link } from "react-router-dom";
import Alert from "react-bootstrap/Alert";

const GATE_MESSAGE =
  "This overview is for registered consortium participants. Complete the consortium registration first and we will open it for you.";
const GATE_LINK_LABEL = "Go to the consortium registration";
const LOAD_ERROR_MESSAGE =
  "The tier overview could not be loaded. Please try again in a moment, or write to us if it keeps failing.";

// Only a refusal means the caller has no registration to show: 403 from the
// consortium service, 401 from the auth middleware. A network failure, a 5xx or
// a malformed response is an outage, and sending a registered participant back
// to the registration form would be both wrong and misleading.
function isRegistrationRefusal(error) {
  return error?.status === 401 || error?.status === 403;
}

export default function ConsortiumTiersError({ error }) {
  if (!isRegistrationRefusal(error)) {
    return <Alert variant="danger">{LOAD_ERROR_MESSAGE}</Alert>;
  }

  return (
    <Alert variant="warning">
      <p>{GATE_MESSAGE}</p>
      <Link className="btn btn-primary" to="/consortium#register">
        {GATE_LINK_LABEL}
      </Link>
    </Alert>
  );
}
