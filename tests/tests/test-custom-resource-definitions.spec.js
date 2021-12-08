/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadRandomCRD } from '../support/loadCRD';

context('Test Create Resource Definitions', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to Create Resource Definition', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Custom Resource Definitions')
      .click();
  });

  it('Create Create Resource Definition', () => {
    cy.getIframeBody()
      .contains('Create Custom Resource Definition')
      .click();
    loadRandomCRD().then(CRB_TEST => {
      cy.getIframeBody()
        .find('[role="document"]')
        .contains('group')
        .click()
        .type(
          '{selectall}{backspace}{selectall}{backspace}{selectall}{backspace}',
        );

      cy.wait(40000);
    });
  });
});
