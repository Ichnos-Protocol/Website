// Label strings are copied verbatim from
// client/src/constants/consortiumContent.js. The e2e package is standalone
// (its own package.json, no path into client/src), so these are duplicated by
// design — a copy here must follow any change made there.
const INTEREST_LABEL =
  'I am interested in joining the battery passport consortium.';
const POSITION_LABEL = 'What is your position in the consortium?';
const CHAIN_ROLE_LABEL = 'Which part of the value chain do you cover?';
const PRODUCT_LINE_LABEL =
  'Which product line or use case would you bring in?';
const CUSTOMER_REQUEST_LABEL =
  'Which customer asked you for battery passport data, and what did they ask for?';
const DATA_NEEDS_LABEL =
  'Which data do you need from others, and which data must you publish yourself?';
const SUBMIT_REGISTRATION_LABEL = 'Submit registration';
const UPDATE_REGISTRATION_LABEL = 'Update my registration';

export class ConsortiumPage {
  constructor(page) {
    this.page = page;
  }

  // ─── /consortium — registration section ───

  // The #register section and its heading are the date-stable anchors for
  // /consortium — the hero copy flips after the registration deadline.
  get registerSection() {
    return this.page.locator('#register');
  }

  get registerHeading() {
    return this.registerSection.getByRole('heading', { name: 'Register' });
  }

  get interestCheckbox() {
    return this.page.getByRole('checkbox', { name: INTEREST_LABEL });
  }

  get positionSelect() {
    return this.page.getByLabel(POSITION_LABEL);
  }

  get chainRoleSelect() {
    return this.page.getByLabel(CHAIN_ROLE_LABEL);
  }

  get productLineInput() {
    return this.page.getByLabel(PRODUCT_LINE_LABEL);
  }

  get customerRequestInput() {
    return this.page.getByLabel(CUSTOMER_REQUEST_LABEL);
  }

  get dataNeedsInput() {
    return this.page.getByLabel(DATA_NEEDS_LABEL);
  }

  get questionInput() {
    return this.page.getByLabel('Question 1');
  }

  get inquiryConsent() {
    return this.page.getByRole('checkbox', { name: /agree to be contacted/i });
  }

  // Regex over a distinctive slice — the full consent sentence is long enough
  // that an exact-name match is brittle against copy edits.
  get consortiumConsent() {
    return this.page.getByRole('checkbox', {
      name: /share my company name and use-case summary/i,
    });
  }

  get submitRegistrationButton() {
    return this.page.getByRole('button', { name: SUBMIT_REGISTRATION_LABEL });
  }

  get updateRegistrationButton() {
    return this.page.getByRole('button', { name: UPDATE_REGISTRATION_LABEL });
  }

  // Radios render as inline Form.Check, so the accessible name is the option
  // label ("Yes", "Not yet, but we could prepare one", "No",
  // "Not applicable" / "November 2026", "Later").
  dataExtractRadio(label) {
    return this.page.getByRole('radio', { name: label });
  }

  preferredStartRadio(label) {
    return this.page.getByRole('radio', { name: label });
  }

  // ─── /consortium/tiers ───

  chooseTierButton(title) {
    return this.page.getByRole('button', { name: `Choose ${title}` });
  }

  get registrationConfirmation() {
    return this.page.getByText(/You are registered/);
  }

  async fillRegistration({
    position,
    chainRole,
    productLine,
    dataExtract,
    preferredStart,
  }) {
    await this.positionSelect.selectOption(position);
    await this.chainRoleSelect.selectOption(chainRole);
    await this.productLineInput.fill(productLine);
    await this.dataExtractRadio(dataExtract).check();
    await this.preferredStartRadio(preferredStart).check();
  }

  async acceptConsents() {
    await this.inquiryConsent.check();
    await this.consortiumConsent.check();
  }

  async submitRegistration() {
    await this.submitRegistrationButton.click();
  }

  async chooseTier(title) {
    await this.chooseTierButton(title).click();
  }
}
