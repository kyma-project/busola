/// <reference types="cypress" />

const DOCKER_IMAGE = 'test-image';
const DEPLOYMENT_NAME = 'all-namespaces-test-deployment';

context('Test navigation features', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it("Navigates to Cluster Overview when namespace in url doesn't exist", () => {
    cy.navigateTo('Workloads', 'Deployments');
    cy.url().then((url) => {
      const newurl = url.replace(
        Cypress.env('NAMESPACE_NAME'),
        'non-exist-namespace',
      );
      cy.visit(newurl);
    });

    cy.wait(2000);
    cy.contains('Incorrect path');
    cy.contains('OK').click();
    cy.contains('ui5-title', 'Cluster Overview');
  });

  it('Correctly displays resource after refresh on all-namespaces', () => {
    cy.goToNamespaceDetails();
    cy.navigateTo('Workloads', 'Deployments');
    cy.openCreate();

    cy.get('[accessible-name="Deployment name"]:visible')
      .find('input')
      .click()
      .clear()
      .type(DEPLOYMENT_NAME, { force: true });

    cy.get('[placeholder^="Enter the Docker image"]:visible')
      .find('input')
      .type(DOCKER_IMAGE);

    cy.saveChanges('Create');

    cy.get('ui5-dynamic-page')
      .find('ui5-dynamic-page-title')
      .contains(DEPLOYMENT_NAME)
      .should('be.visible');

    cy.get('ui5-side-navigation')
      .find('.namespace-combobox')
      .find('ui5-combobox#NamespaceComboBox')
      .find('ui5-icon[accessible-name="Select Options"]:visible')
      .click();

    cy.get('ui5-cb-item:visible').contains('All Namespaces').click();

    cy.get('ui5-dynamic-page')
      .find('ui5-dynamic-page-title')
      .contains(DEPLOYMENT_NAME)
      .should('not.exist');

    cy.url().should('not.include', 'resourceNamespace=');

    cy.typeInSearch(DEPLOYMENT_NAME, true);
    cy.clickGenericListLink(DEPLOYMENT_NAME);

    cy.url().should(
      'include',
      `resourceNamespace=${Cypress.env('NAMESPACE_NAME')}`,
    );

    cy.get('ui5-dynamic-page')
      .find('ui5-dynamic-page-title')
      .contains(DEPLOYMENT_NAME)
      .should('be.visible');

    cy.reload();

    cy.get('ui5-dynamic-page')
      .find('ui5-dynamic-page-title')
      .contains(DEPLOYMENT_NAME)
      .should('be.visible');
  });

  it('Keeps resourceNamespace param when entering/exiting fullscreen', () => {
    cy.getMidColumn()
      .find('ui5-button[accessible-name="enter-full-screen"]')
      .click();

    cy.url().should(
      'include',
      `resourceNamespace=${Cypress.env('NAMESPACE_NAME')}`,
    );

    cy.getMidColumn()
      .find('ui5-button[accessible-name="close-full-screen"]')
      .click();

    cy.url().should(
      'include',
      `resourceNamespace=${Cypress.env('NAMESPACE_NAME')}`,
    );

    cy.closeMidColumn();
    cy.url().should('not.include', 'resourceNamespace=');

    cy.deleteFromGenericList('Deployment', DEPLOYMENT_NAME, {
      clearSearch: false,
      checkIfResourceIsRemoved: false,
      selectSearchResult: true,
      searchInPlainTableText: true,
    });
  });
});
