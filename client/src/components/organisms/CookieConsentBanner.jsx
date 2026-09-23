import ReactCookieConsent from 'react-cookie-consent';

import { ROUTE_PRIVACY } from '../../constants/routes';

export default function CookieConsentBanner() {
  return (
    <ReactCookieConsent
      location="bottom"
      buttonText="Accept cookies"
      cookieName="ichnos_cookie_consent"
      containerClasses="cookie-consent-banner"
      buttonClasses="cookie-consent-button"
      expires={365}
    >
      We use cookies to improve your experience. By continuing, you
      accept our cookie policy.{' '}
      <a href={ROUTE_PRIVACY} className="cookie-consent-link" data-testid="cookie-consent-link">
        Privacy Policy
      </a>
    </ReactCookieConsent>
  );
}
