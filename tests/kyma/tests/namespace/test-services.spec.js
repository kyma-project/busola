const SERVICE_NAME = 'service';
const SERVICE_KEY = `app`;
const SERVICE_VALUE = 'proxy';
const SERVICE_TARGET_PORT = 'http-web-svc';
const SERVICE_DIFF_TYPE = 'NodePort';
const SERVICE_PORT = '(80) --> (http-web-svc)';

context('Test Services', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Service', () => {
    cy.navigateTo('Discovery and Network', 'Services');

    cy.openCreate();

    cy.get('[aria-label="Service name"]:visible')
      .find('input')
      .click()
      .type(SERVICE_NAME, { force: true });

    cy.get('[placeholder="Enter key"]:visible', { log: false })
      .find('input')
      .eq(0)
      .click()
      .clear()
      .type(SERVICE_KEY, { force: true });

    cy.get('[placeholder="Enter value"]:visible', { log: false })
      .find('input')
      .filterWithNoValue()
      .first()
      .type(SERVICE_VALUE, { force: true });

    cy.get('[aria-label="expand Ports"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.get('[aria-label="Service name"]:visible')
      .eq(1)
      .find('input')
      .click()
      .type(SERVICE_NAME, { force: true });

    cy.get('[placeholder="Enter Target Port"]:visible')
      .find('input')
      .click()
      .clear()
      .type(SERVICE_TARGET_PORT);

    cy.saveChanges('Create');
  });

  it('Inspect Services', () => {
    cy.getMidColumn().contains(SERVICE_PORT);
  });

  it('Edit a Service', () => {
    cy.wait(1000);

    cy.inspectTab('Edit');

    cy.get('[placeholder="Enter Type"]:visible')
      .find('input')
      .click()
      .clear()
      .type(SERVICE_DIFF_TYPE);

    cy.saveChanges('Edit');
    cy.getMidColumn().inspectTab('View');
  });

  it('Inspect updated Service', () => {
    cy.getMidColumn().contains(SERVICE_DIFF_TYPE);
    cy.getMidColumn().contains(SERVICE_PORT);
  });

  it('Inspect Service list', () => {
    cy.inspectList(SERVICE_NAME);
  });
});
