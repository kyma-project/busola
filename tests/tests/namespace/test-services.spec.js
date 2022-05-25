import 'cypress-file-upload';

const SERVICE_NAME = 'orders-service';
import { loadFile } from '../../support/loadFile';

async function loadService() {
  const service = await loadFile('test-services.yaml');
  const newService = { ...service };

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

    cy.getIframeBody()
      .contains('Create Service')
      .click();

    cy.wrap(loadService()).then(S_CONFIG => {
      const S = JSON.stringify(S_CONFIG);
      cy.pasteToMonaco(S);
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.url().should('match', new RegExp(`/services/details/${SERVICE_NAME}$`));
  });

  it('Inspect Service', () => {
    cy.getIframeBody().contains('h3', SERVICE_NAME);
    cy.getIframeBody().contains('8080');
  });

  it('Inspect services list', () => {
    cy.inspectList('Services', SERVICE_NAME);
  });
});
