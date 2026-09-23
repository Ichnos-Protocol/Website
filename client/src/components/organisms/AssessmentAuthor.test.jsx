import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import AssessmentAuthor from './AssessmentAuthor';
import { ASSESSMENT_AUTHOR } from '../../constants/readinessAssessmentContent';
import {
  CATENA_X_LABEL_ASSET,
  CATENA_X_LABEL_ASSET_NEG,
  CATENA_X_MEMBER_LABEL_ASSET,
  CATENA_X_MEMBER_LABEL_ASSET_NEG,
} from '../../constants/catenaXStatus';

/*
 * Section 4.7 in its rendered form. The label assets are imported here only,
 * as the detector alphabet: the component itself must never import them.
 */

const LABEL_ASSETS = [
  CATENA_X_LABEL_ASSET,
  CATENA_X_LABEL_ASSET_NEG,
  CATENA_X_MEMBER_LABEL_ASSET,
  CATENA_X_MEMBER_LABEL_ASSET_NEG,
];

describe('AssessmentAuthor', () => {
  it('renders the author line from the constant', () => {
    renderWithProviders(<AssessmentAuthor />);

    expect(screen.getByTestId('assessment-author-line')).toHaveTextContent(
      ASSESSMENT_AUTHOR,
    );
  });

  it('renders no image and no label asset', () => {
    const { container } = renderWithProviders(<AssessmentAuthor />);

    expect(container.querySelector('img')).toBeNull();
    LABEL_ASSETS.forEach((asset) => {
      expect(container.innerHTML).not.toContain(asset);
    });
    expect(container.innerHTML).not.toContain('_cropped');
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<AssessmentAuthor />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
