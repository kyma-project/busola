/// <reference types="cypress" />
import 'cypress-file-upload';
import jsyaml from 'js-yaml';

const NAME = 'resource-name';
const NAMESPACE = 'testin';

context('Test extensibility variables', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster({
      fileName: 'kubeconfig-k3s.yaml',
      storage: 'Session storage',
    });
    cy.createNamespace(NAMESPACE);
  });

  beforeEach(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
  });

  it('Creates the EXT test resources config', () => {
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('Upload YAML').click();

    cy.loadFiles(
      'examples/testing/configuration/test-resource-configmap.yaml',
      'examples/testing/configuration/test-resource-crd.yaml',
    ).then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.contains('Submit').click();

    cy.get('.fd-dialog__body')
      .find('.sap-icon--message-success')
      .should('have.length', 2);

    cy.loadFiles('examples/testing/samples/test-resource-samples.yaml').then(
      resources => {
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.contains('Submit').click();

    cy.get('.fd-dialog__body')
      .find('.sap-icon--message-success')
      .should('have.length', 2);
  });

  it('Tests variables', () => {
    cy.loginAndSelectCluster({
      fileName: 'kubeconfig-k3s.yaml',
      storage: 'Session storage',
    });
    cy.contains('Namespaces').click();

    cy.contains('a', NAMESPACE).click();

    cy.getLeftNav()
      .contains('Testin')
      .click();

    cy.getLeftNav()
      .contains('Test Resources')
      .click();

    cy.contains('Create Test Resource').click();

    cy.get('.fd-dialog__content').as('form');

    // test vars with no default value
    cy.get('@form')
      .find('[data-testid="Simple / Advanced"]:visible')
      .find('input')
      .should('be.empty');

    // test vars with enums
    cy.get('@form')
      .find('[data-testid="Simple / Advanced"]:visible')
      .find('span')
      .find('[aria-label="Combobox input arrow"]:visible', { log: false })
      .click();

    cy.get('[role="list"]')
      .contains('simple')
      .should('exist');

    cy.get('[role="list"]')
      .contains('advanced')
      .should('exist');

    // test if fielsd based on visibility are not visible
    cy.get('@form')
      .find('[data-testid="spec.name"]:visible')
      .should('not.exist');

    cy.get('[aria-label="expand Advanced"]:visible', { log: false }).should(
      'not.exist',
    );

    // test visibility based on var (select 'simple')
    cy.get('[role="list"]')
      .contains('simple')
      .click();

    cy.get('@form')
      .find('[data-testid="spec.name"]:visible')
      .should('exist');

    // test visibility based on var (select 'advanced')
    cy.get('@form')
      .find('[data-testid="Simple / Advanced"]:visible')
      .find('span')
      .find('[aria-label="Combobox input arrow"]:visible', { log: false })
      .click();

    cy.get('[role="list"]')
      .contains('advanced')
      .click();

    cy.get('[aria-label="expand Advanced"]:visible', { log: false }).should(
      'exist',
    );

    // test vars with defaultValue
    cy.get('@form')
      .find('[data-testid="varWithDefaultValue"]:visible')
      .should('have.value', 'default');

    // TO DO test vars with dynamicValue
    // cy.get('@form')
    //   .find('[data-testid="varWithDynamicValue"]:visible')
    //   .find('input')
    //   .should('have.value', 'Is default');
  });

  it('Tests data sources and triggers', () => {
    cy.get('.fd-dialog__content').as('form');

    // test if trigger / subscribe works
    cy.get('@form')
      .find('[data-testid="spec.combined"]:visible')
      .should('have.value', '');

    cy.get('@form')
      .find('[data-testid="spec.prefix"]:visible')
      .type('1');
    cy.get('@form')
      .find('[data-testid="anotherName"]:visible')
      .type('2');
    cy.get('@form')
      .find('[data-testid="spec.suffix"]:visible')
      .type('3');

    cy.get('@form')
      .find('[data-testid="spec.combined"]:visible')
      .should('have.value', '123');

    // test if trigger / subscribe works with data sources
    cy.get('@form')
      .find('[data-testid="spec.existingResources"]:visible')
      .should('have.value', '');

    cy.get('@form')
      .find('[data-testid="spec.trigger"]:visible')
      .type('s');
    cy.wait(100);
    cy.get('@form')
      .find('[data-testid="spec.trigger"]:visible')
      .clear()
      .type('sth');

    cy.get('@form')
      .find('[data-testid="spec.existingResources"]:visible')
      .should('have.value', '["var1","var2"]');

    // create resource
    cy.get('@form')
      .find('[arialabel="TestResource name"]:visible')
      .clear()
      .type(NAME);

    cy.get('@form')
      .contains('button', 'Create')
      .click();

    cy.contains('h3', NAME).should('be.visible');
  });
});
