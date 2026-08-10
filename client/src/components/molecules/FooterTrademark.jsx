import { TRADEMARK_NOTICE } from '../../constants/catenaXStatus';

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
