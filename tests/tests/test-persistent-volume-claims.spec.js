/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadPVC } from '../support/loadPVC';

const FILE_NAME = 'test-persistent-volume-claim.yaml';

const PVC_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

const CAPACITY_VALUE = '1Gi';
const ACCESS_MODES_VALUE = 'ReadWriteOnce';
const VOLUME_MODE_VALUE = 'Filesystem';

context('Test Persistent Volume Claim', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to Persistent Volume Claims', () => {
    cy.getLeftNav()
      .contains('Storage')
      .click();

    cy.getLeftNav()
      .contains('Persistent Volume Claims')
      .click();
  });

  it('Create a Persistent Volume Claim', () => {
    cy.getIframeBody()
      .contains('Create Persistent Volume Claim')
      .click();

    cy.wrap(
      loadPVC(
        PVC_NAME,
        Cypress.env('NAMESPACE_NAME'),
        Cypress.env('STORAGE_CLASS_NAME'),
        FILE_NAME,
      ),
    ).then(PVC_CONFIG => {
      const PVC = JSON.stringify(PVC_CONFIG);
      cy.getIframeBody()
        .find('[role="presentation"],[class="view-lines"]')
        .first()
        .click()
        .clearMonaco()
        .type(PVC, { parseSpecialCharSequences: false });
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', PVC_NAME, { timeout: 5000 })
      .should('be.visible');
  });

  it('Check the Persistent Volume Claims details', () => {
    cy.getIframeBody()
      .contains(CAPACITY_VALUE)
      .should('be.visible');

    cy.getIframeBody()
      .contains(ACCESS_MODES_VALUE)
      .should('be.visible');

    cy.getIframeBody()
      .contains(VOLUME_MODE_VALUE)
      .should('be.visible');

    cy.getIframeBody()
      .contains('a', Cypress.env('STORAGE_CLASS_NAME'), { timeout: 70000 })
      .should('be.visible');
  });

  it('Check the Persistent Volume Claims list', () => {
    cy.getLeftNav()
      .contains('Persistent Volume Claims')
      .click();

    cy.getIframeBody()
      .contains(PVC_NAME)
      .parent()
      .getIframeBody()
      .contains(CAPACITY_VALUE);
  });

  it('Delete a Persistent Volume Claim', () => {
    cy.getIframeBody()
      .contains('.fd-table__row', PVC_NAME)
      .find('button[data-testid="delete"]')
      .click();

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', PVC_NAME, { timeout: 5000 })
      .should('not.exist');
  });
});
