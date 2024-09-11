context('Test Module-templates', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Go to Keda Module Template', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.get('ui5-table-row')
      .contains('kcp-system')
      .click();

    cy.navigateTo('Kyma', 'Module Templates');

    cy.contains('keda-fast').click();

    cy.url().should('match', new RegExp(`/moduletemplates/keda-fast`));
  });

  it('Inspect Module-templates', () => {
    cy.contains('operator.kyma-project.io/module-name=keda');
    cy.contains('Data');
    cy.contains('Descriptor');

    cy.contains('View YAML').click();

    cy.contains('keda-fast.yaml');

    cy.get('[aria-label="close drawer"]:visible').click();
  });
});
