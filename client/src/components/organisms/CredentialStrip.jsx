import Container from 'react-bootstrap/Container';

import { CREDENTIALS } from '../../constants/credentials';
import CredentialLabel from '../molecules/CredentialLabel';

export default function CredentialStrip() {
  return (
    <section
      className="credential-strip"
      aria-label="Credentials and recognitions"
    >
      <Container>
        <div className="credential-strip__items">
          {CREDENTIALS.map((credential) => (
            <div
              className="credential-strip__item"
              key={credential.id}
              data-testid={`credential-${credential.id}`}
            >
              <CredentialLabel
                label={credential.label}
                isCatenaXLabel={credential.isCatenaXLabel}
                href={credential.href}
              />
              <p className="credential-strip__note">{credential.note}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
