/// <reference types="cypress" />
import 'cypress-file-upload';
import jsyaml from 'js-yaml';

const NAME = 'resource-name';
const NAMESPACE = 'testin';

context('Test extensibility variables', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();

    cy.loginAndSelectCluster({
      fileName: 'kubeconfig-k3s.yaml',
      storage: 'Session storage',
      staticToken: true,
    });

    cy.createNamespace(NAMESPACE);
  });

  it('Creates the EXT test resources config', () => {
    cy.getLeftNav()
      .contains('Cluster Details', { includeShadowDom: true })
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

  it('Navigate to Test Resource Creation', () => {
    cy.loginAndSelectCluster({
      fileName: 'kubeconfig-k3s.yaml',
      storage: 'Session storage',
      staticToken: true,
    });

    cy.contains('Namespaces', { includeShadowDom: true }).click();

    cy.contains('a', NAMESPACE).click();

    cy.getLeftNav()
      .contains('Testin', { includeShadowDom: true })
      .click();

    cy.getLeftNav()
      .contains(/^Test Resources$/, { includeShadowDom: true })
      .click();

    cy.contains('Create Test Resource').click();
  });

  it('Tests variables', () => {
    cy.get('[role="document"]').as('form');

    // test vars with no default value
    cy.get('@form')
      .find('input')
      .should('be.empty');

    // test vars with enums
    cy.get('@form')
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
      .find('[data-testid="$varWithDefaultValue"]:visible')
      .should('have.value', 'default');

    // test vars with dynamicValue
    cy.get('@form')
      .find('[data-testid="$varWithDynamicValue"]:visible')
      .should('have.value', 'dynamic name');
  });

  it('Tests presets', () => {
    cy.get('[role="document"]').as('form');
    // test default preset
    cy.get('@form')
      .find('[arialabel="TestResource name"]:visible')
      .should('have.value', NAME);

    // test presets
    cy.get('@form')
      .find('.fd-select__text-content:visible')
      .contains('Choose preset')
      .click();

    cy.get('[role="list"]')
      .contains('Fixes')
      .click();

    cy.get('@form')
      .find('[data-testid="spec.prefix"]:visible')
      .should('have.value', 'prefix');

    cy.get('@form')
      .find('[data-testid="spec.suffix"]:visible')
      .should('have.value', 'suffix');

    // test if dynamicValue is updated
    cy.get('@form')
      .find('[data-testid="$varWithDynamicValue"]:visible')
      .should('have.value', 'unnamed');
  });

  it('Tests templates', () => {
    cy.get('[aria-label="expand Array Of Objects"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.get('[data-testid="spec.arrayOfObjects.0.withValue"]:visible').should(
      'have.value',
      'template value',
    );

    cy.get('[data-testid="spec.arrayOfObjects.0.withoutValue"]:visible').should(
      'be.empty',
    );
  });

  it('Tests data sources and triggers', () => {
    cy.get('[role="document"]').as('form');

    // test if trigger / subscribe works
    cy.get('@form')
      .find('[data-testid="spec.combined"]:visible')
      .should('have.value', '');

    cy.get('@form')
      .find('[data-testid="spec.prefix"]:visible')
      .clear()
      .type('a');
    cy.get('@form')
      .find('[data-testid="$anotherName"]:visible')
      .type('b');
    cy.get('@form')
      .find('[data-testid="spec.suffix"]:visible')
      .clear()
      .type('c');

    cy.get('@form')
      .find('[data-testid="spec.combined"]:visible')
      .should('have.value', 'abc');

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
      .invoke('val')
      .should('have.string', 'var1');

    cy.get('@form')
      .find('[data-testid="spec.existingResources"]:visible')
      .invoke('val')
      .should('have.string', 'var2');
  });

  it('Tests MultiCheckbox', () => {
    cy.get('[role="document"]').as('form');

    cy.get('@form')
      .find('[data-testid="spec.arrayOfStrings.value_1"]:visible')
      .find('input')
      .should('not.be.checked');

    cy.get('@form')
      .find('[data-testid="spec.arrayOfStrings.value_1"]:visible')
      .find('label')
      .click();

    cy.get('@form')
      .find('[data-testid="spec.arrayOfStrings.value_3"]:visible')
      .find('label')
      .click();

    cy.get('[ariaLabel="TestResource name"]:visible', { log: false })
      .type(NAME)
      .click();

    // create resource
    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();

    // check arrayOfStrings
    cy.contains('h3', NAME).should('be.visible');
    cy.contains('value_1, value_3').should('exist');
    cy.contains('value_2').should('not.exist');
  });
});
