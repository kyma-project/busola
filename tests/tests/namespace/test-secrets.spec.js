const SECRET_NAME = `secret-${Math.floor(Math.random() * 9999) + 1000}`;

const SECRET_KEY = 'secret-key';
const SECRET_VALUE = 'secret-value';
const SECRET_VALUE2 = 'new-secret-value';

const SECRET2_KEY = 'secret2-key';
const SECRET2_VALUE = 'secret2-value';

const SECRET3_KEY = 'secret3-key';
const SECRET3_VALUE = 'secret3-value';

context('Test Secrets', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a secret', () => {
    cy.navigateTo('Configuration', 'Secrets');

    cy.getIframeBody()
      .contains('Create Secret')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Secret name"]:visible')
      .type(SECRET_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible')
      .type(`${SECRET_KEY}{enter}{backspace}${SECRET_VALUE}`);

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible')
      .last()
      .type(`${SECRET2_KEY}{enter}{backspace}${SECRET2_VALUE}`);

    cy.getIframeBody()
      .contains('Encode')
      .filter(':visible')
      .click();

    cy.getIframeBody().contains(btoa(SECRET_VALUE));

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.url().should('match', new RegExp(`/secrets/details/${SECRET_NAME}$`));
  });

  it('Checking a secret details', () => {
    cy.getIframeBody().contains(SECRET_NAME);

    cy.getIframeBody()
      .contains('.layout-panel-row', SECRET2_KEY)
      .contains(btoa(SECRET2_VALUE));

    cy.getIframeBody()
      .contains('.layout-panel-row', SECRET_KEY)
      .contains(btoa(SECRET_VALUE));

    cy.getIframeBody()
      .contains('Decode')
      .click();

    cy.getIframeBody()
      .contains('.layout-panel-row', SECRET_KEY)
      .contains(SECRET_VALUE);

    cy.getIframeBody()
      .contains('Encode')
      .click();
  });

  it('Edit a secret', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible')
      .eq(0)
      .type(`{selectall}${SECRET_VALUE2}`);

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible')
      .eq(2)
      .type(`${SECRET3_KEY}{enter}{backspace}${SECRET3_VALUE}`);

    cy.getIframeBody()
      .find('[ariaLabel="Delete"]:visible')
      .eq(1)
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();
  });

  it('Checking an updated secret', () => {
    cy.getIframeBody()
      .contains('.layout-panel-row', SECRET_KEY)
      .contains(btoa(SECRET_VALUE2));

    cy.getIframeBody()
      .contains('.layout-panel-row', SECRET2_KEY)
      .should('not.exist');

    cy.getIframeBody()
      .contains('.layout-panel-row', SECRET3_KEY)
      .contains(btoa(SECRET3_VALUE));
  });

  it('Check list', () => {
    cy.inspectList('Secrets', SECRET_NAME);
  });
});
