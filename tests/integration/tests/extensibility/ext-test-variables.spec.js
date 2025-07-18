/// <reference types="cypress" />
import 'cypress-file-upload';
import jsyaml from 'js-yaml';

const NAME = 'resource-name';
const NAMESPACE = 'testin';

context('Test extensibility variables', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();

    cy.loginAndSelectCluster();

    cy.createNamespace(NAMESPACE);
  });

  it('Creates the EXT test resources config', () => {
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.loadFiles(
      'examples/testing/configuration/test-resource-configmap.yaml',
      'examples/testing/configuration/test-resource-crd.yaml',
    ).then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .find('.status-message-success')
      .should('have.length', 2);

    cy.loadFiles('examples/testing/samples/test-resource-samples.yaml').then(
      resources => {
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .find('.status-message-success')
      .should('have.length', 2);
  });

  it('Navigate to Test Resource Creation', () => {
    cy.loginAndSelectCluster();

    cy.getLeftNav()
      .find('ui5-side-navigation-item')
      .contains('Namespaces')
      .click();

    cy.wait(500)
      .get('ui5-input[id="search-input"]:visible')
      .find('input')
      .type(NAMESPACE);

    cy.clickListLink(NAMESPACE);

    cy.navigateTo('Testin', 'Test Resources');

    cy.openCreate();
  });

  it('Tests variables', () => {
    cy.wait(500)
      .get('.create-form')
      .as('form');

    // test vars with no default value
    cy.get('@form')
      .find('input')
      .should('be.empty');

    // test vars with enums
    cy.get('@form')
      .get('.form-field')
      .find('ui5-combobox')
      .find('ui5-icon[accessible-name="Select Options"]:visible', {
        log: false,
      })
      .click();

    cy.get('ui5-cb-item:visible')
      .contains('simple')
      .should('exist');

    cy.get('ui5-cb-item:visible')
      .contains('advanced')
      .should('exist');

    // test if fielsd based on visibility are not visible
    cy.get('@form')
      .find('[data-testid="spec.name"]:visible')
      .should('not.exist');

    cy.get('[aria-label="Advanced, collapsed"]:visible', { log: false }).should(
      'not.exist',
    );

    // test visibility based on var (select 'simple')
    cy.get('ui5-cb-item:visible')
      .contains('simple')
      .click();

    cy.get('@form')
      .find('[data-testid="spec.name"]:visible')
      .should('exist');

    // test visibility based on var (select 'advanced')
    cy.get('@form')
      .get('.form-field')
      .find('ui5-combobox')
      .find('ui5-icon[accessible-name="Select Options"]:visible', {
        log: false,
      })
      .click();

    cy.get('ui5-cb-item:visible')
      .contains('advanced')
      .click();

    cy.get('[aria-label="Advanced, collapsed"]:visible', { log: false }).should(
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
    cy.get('.create-form').as('form');
    // test default preset
    cy.get('@form')
      .find('[accessible-name="TestResource name"]:visible')
      .should('have.value', NAME);

    // test presets
    cy.get('@form')
      .get('ui5-combobox[placeholder="Choose template"]:visible')
      .click();

    cy.get('ui5-cb-item:visible')
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
    cy.get('[aria-label="Array Of Objects, collapsed"]:visible', { log: false })
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
    cy.get('.create-form').as('form');

    // test if trigger / subscribe works
    cy.get('@form')
      .find('[data-testid="spec.combined"]:visible')
      .should('have.value', '');

    cy.get('@form')
      .find('[data-testid="spec.prefix"]:visible')
      .find('input')
      .clear()
      .type('a');
    cy.get('@form')
      .find('[data-testid="$anotherName"]:visible')
      .find('input')
      .type('b');
    cy.get('@form')
      .find('[data-testid="spec.suffix"]:visible')
      .find('input')
      .clear()
      .type('c');
    cy.get('@form')
      .find('[data-testid="spec.combined"]:visible')
      .find('input')
      .click()
      .should('have.value', 'abc');

    // test if trigger / subscribe works with data sources
    cy.get('@form')
      .find('[data-testid="spec.existingResources"]:visible')
      .find('input')
      .should('have.value', '');

    cy.get('@form')
      .find('[data-testid="spec.trigger"]:visible')
      .find('input')
      .type('s');
    cy.wait(100);
    cy.get('@form')
      .find('[data-testid="spec.trigger"]:visible')
      .find('input')
      .clear()
      .type('sth');

    // TO DO no clue why this is not working
    // cy.get('@form')
    //   .find('[data-testid="spec.existingResources"]:visible')
    //   .find('input')
    //   .invoke('val')
    //   .should('have.string', 'var1');

    // cy.get('@form')
    //   .find('[data-testid="spec.existingResources"]:visible')
    //   .find('input')
    //   .invoke('val')
    //   .should('have.string', 'var2');
  });

  it('Tests MultiCheckbox', () => {
    cy.get('.create-form').as('form');

    cy.get('@form')
      .get('ui5-checkbox[data-testid="spec.arrayOfStrings.value_1"]:visible')
      .should('not.be.checked');

    cy.get('@form')
      .get('ui5-checkbox[data-testid="spec.arrayOfStrings.value_1"]:visible')
      .click();

    cy.get('@form')
      .get('ui5-checkbox[data-testid="spec.arrayOfStrings.value_3"]:visible')
      .click();

    cy.get('[accessible-name="TestResource name"]', { log: false })
      .find('input')
      .type(NAME)
      .click();

    cy.get('@form')
      .contains('ui5-segmented-button-item:visible', 'YAML')
      .click();

    cy.saveChanges('Create');

    // check arrayOfStrings
    cy.getMidColumn()
      .contains('ui5-title', NAME)
      .should('be.visible');
    cy.getMidColumn()
      .contains('value_1, value_3')
      .should('exist');
    cy.getMidColumn()
      .contains('value_2')
      .should('not.exist');
  });
});
