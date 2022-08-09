/// <reference types="cypress" />

context('Create Application', () => {
  it('aha!', () => {
    cy.fixture(
      'examples/pizzas/configuration/pizzas-configmap.yaml',
    ).then(file => expect(file).to.equal('kotek'));
  });
});
