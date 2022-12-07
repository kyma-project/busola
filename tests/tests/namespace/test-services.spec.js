import 'cypress-file-upload';

import { loadFile } from '../../support/loadFile';

const SERVICE_NAME = `orders-service-${Math.floor(Math.random() * 9999) +
  1000}`;

async function loadService() {
  const service = await loadFile('test-services.yaml');
  const newService = { ...service };
  service.metadata.name = SERVICE_NAME;
  service.metadata.namespace = Cypress.env('NAMESPACE_NAME');

  return newService;
}

context('Test Services', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Service', () => {
    cy.navigateTo('Discovery and Network', 'Services');

    cy.contains('Create Service').click();

    cy.wrap(loadService()).then(S_CONFIG => {
      const S = JSON.stringify(S_CONFIG);
      cy.pasteToMonaco(S);
    });

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.url().should('match', new RegExp(`/services/${SERVICE_NAME}$`));
  });

  it('Inspect Service', () => {
    cy.contains('h3', SERVICE_NAME);
    cy.contains('8080');
  });

  it('Inspect services list', () => {
    cy.inspectList('Services', SERVICE_NAME);
  });
});
