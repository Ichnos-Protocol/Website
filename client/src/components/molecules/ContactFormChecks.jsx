import Form from "react-bootstrap/Form";

import { CONSORTIUM_INTEREST_LABEL } from "../../constants/consortiumContent";
import ConsortiumFields from "./ConsortiumFields";

const INQUIRY_CONSENT_LABEL =
  "I agree to be contacted regarding my enquiry. See Privacy Policy.";

export default function ContactFormChecks({
  consent,
  onConsentChange,
  showConsortium = true,
  interestProps,
  fieldsProps,
}) {
  return (
    <>
      <Form.Check
        type="checkbox"
        className="mb-3"
        required
        id="inquiry-consent"
        label={INQUIRY_CONSENT_LABEL}
        checked={consent}
        onChange={(e) => onConsentChange(e.target.checked)}
      />
      {showConsortium && (
        <>
          <Form.Check
            type="checkbox"
            className="mb-3"
            id="consortium-interest"
            label={CONSORTIUM_INTEREST_LABEL}
            {...interestProps}
          />
          <ConsortiumFields {...fieldsProps} />
        </>
      )}
    </>
  );
}
