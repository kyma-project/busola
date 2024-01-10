/// <reference types="cypress" />

function containsInShadowDom(selector, content, options) {
  return cy
    .get(selector, options)
    .contains(content)
    .parentsUntil(selector)
    .last()
    .parent();
}

function testAndSelectOptions(section, selection) {
  cy.contains('.header', section).as(`${section}Header`);
  cy.contains('.form-field', section).as(`${section}FormField`);

  cy.get(`@${section}Header`)
    .contains('Add all')
    .click();
  cy.get(`@${section}FormField`)
    .find('[type="checkbox"]')
    .should('be.checked');

  cy.get(`@${section}Header`)
    .contains('Remove all')
    .click();

  cy.get(`@${section}FormField`)
    .find('[type="checkbox"]')
    .should('not.be.checked');

  cy.get(`@${section}FormField`)
    .get(`ui5-checkbox[text="${selection}"][data-testid*="${selection}"]`)
    .click();
}

context('Test Cluster Validation Scan', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('CLUSTER_VALIDATION', true);

    // No custom resources for a faster scan
    cy.intercept(
      {
        method: 'GET',
        url: `/backend/apis`,
      },
      {
        groups: [],
      },
    );

    cy.fixture('examples/resource-validation/rule-set.yaml').then(ruleSet => {
      cy.mockConfigMap({
        label: 'busola.io/resource-validation=rule-set',
        data: ruleSet,
      });

      cy.loginAndSelectCluster();
    });
  });

  it('Cluster Scan', () => {
    cy.contains('ui5-title', 'Cluster Validation').should('be.visible');

    cy.contains('Scan Progress').should('not.exist');
    cy.contains('Scan Result').should('not.exist');

    cy.contains('ui5-panel', 'Cluster Validation').as('clusterValidationPanel');

    cy.get('@clusterValidationPanel')
      .contains('Configure')
      .click();

    testAndSelectOptions('Namespaces', 'default');

    cy.contains('Policies').click();
    testAndSelectOptions('Policies', 'TestPolicy');

    cy.contains('Scan Parameters').click();
    cy.contains('.form-field', 'Parallel Requests')
      .find('input:visible')
      .clear()
      .type(1);

    cy.get('ui5-dialog')
      .find('[aria-label="cluster-validation-submit"]')
      .should('be.visible')
      .click();

    cy.get('@clusterValidationPanel')
      .find('ui5-button')
      .contains('Scan')
      .click();

    // wait for scan to finish
    cy.contains('Scan Progress').should('be.visible');

    containsInShadowDom('ui5-card', 'Scan Progress').as('scanProgress');

    cy.get('@scanProgress')
      .contains('100%', { timeout: 30000 })
      .should('exist');

    // Check items in scan result tree
    containsInShadowDom('ui5-card', 'Scan Result')
      .as('scanResult')
      .scrollIntoView();
    cy.get('@scanResult').should('be.visible');

    function findTitle(title) {
      return cy
        .get('@scanResult')
        .scrollIntoView()
        .contains('.ui5-li-title:visible', title);
    }

    function toggleTreeItem(title) {
      findTitle(title)
        .parentsUntil('ui5-tree-item')
        .last()
        .parent()
        .find('.ui5-li-tree-toggle-icon:visible')
        .click();
    }

    findTitle('Cluster').should('be.visible');
    findTitle('Namespace').should('be.visible');

    toggleTreeItem('default');
    toggleTreeItem('ConfigMap');
    toggleTreeItem('kube-root-ca.crt');
    findTitle('This is a test rule').should('be.visible');

    cy.get('@clusterValidationPanel')
      .contains('Clear')
      .click();

    cy.contains('Scan Progress').should('not.exist');
    cy.contains('Scan Result').should('not.exist');
  });
});
