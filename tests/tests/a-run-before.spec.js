import config from '../config';
const ADDRESS = config.localDev
  ? `http://localhost:4200/clusters`
  : `https://busola.${config.domain}/clusters`;

const NAMESPACE_NAME = config.namespace;
describe('Busola - Create Namespace', () => {
  it('Create Namespace', () => {
    cy.getIframeBody()
      .contains('Create Namespace')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .find("input[placeholder='Namespace name']")
      .should('be.visible')
      .type(Cypress.env('NAMESPACE_NAME'));

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });
});
