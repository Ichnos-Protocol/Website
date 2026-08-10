const TRADEMARK_NOTICE =
  'Catena-X® is a registered trademark of Catena-X Automotive Network e.V. ' +
  'Ichnos Protocol Pte. Ltd. is a Catena-X Qualified Advisor; its membership ' +
  'application is in progress. References to Catena-X standards and ' +
  'committees describe factual participation and do not imply certification ' +
  'of Ichnos products or endorsement by the association or its bodies.';

export default function FooterTrademark() {
  return (
    <p
      className="footer-text small text-center mb-0"
      data-testid="footer-trademark"
    >
      {TRADEMARK_NOTICE}
    </p>
  );
}
