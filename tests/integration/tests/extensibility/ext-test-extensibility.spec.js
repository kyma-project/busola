import { chooseComboboxOption } from '../../support/helpers';
import jsyaml from 'js-yaml';

const EXTENSION_DISPLAY_NAME = 'Potato Extension';
const NAMESPACE_NAME = 'potato';
const CR_NAME = 'first-potato';
const FIRST_DESCRIPTION = 'My Description';
const UPDATED_DESCRIPTION = 'Updated description';
const SECOND_DETAIL = 'weight';
const EXTENSION_NAME = 'potatoes';

context('Test Extensibility Create/Update', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();

    cy.loginAndSelectCluster();
  });

  it('Upload test resources', () => {
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.loadFiles('examples/extensions/configuration/potatoes-crd.yaml').then(
      resources => {
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog[header-text="Upload YAML"]')
      .find('.status-message-success')
      .should('have.length', 1);

    cy.loadFiles('examples/extensions/samples/potato.yaml').then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog[header-text="Upload YAML"]')
      .find('.status-message-success')
      .should('have.length', 1);

    cy.get('ui5-dialog[header-text="Upload YAML"]').within(() => {
      cy.contains('ui5-button', 'Close')
        .should('be.visible')
        .click();
    });
  });

  it('Create extension', () => {
    cy.navigateTo('Configuration', 'Extensions');

    cy.openCreate();

    chooseComboboxOption('[id="combobox-input"]', 'potato');

    cy.get(`ui5-input[value="Potatoes"]`)
      .find('input')
      .clear()
      .type(EXTENSION_DISPLAY_NAME);

    cy.get('[aria-label="expand Details Summary"]').click();
    cy.get('ui5-panel[data-testid="details-summary"]').within(() => {
      cy.get('ui5-input[value="description"]')
        .find('input')
        .clear()
        .type(FIRST_DESCRIPTION);

      cy.get('ui5-checkbox[data-testid="spec.weight"]')
        .last()
        .click();
    });

    cy.saveChanges('Create');
  });

  it('Check if Extensions is created', () => {
    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .wait(1000)
      .clear()
      .type(EXTENSION_NAME)
      .get('ui5-li-suggestion-item:visible')
      .contains(EXTENSION_NAME)
      .click();

    cy.get('ui5-table-row')
      .contains(EXTENSION_NAME)
      .should('be.visible');
  });

  it('Check if extension is displayed correctly', () => {
    cy.reload(); //Reload is needed to load new extension

    cy.navigateTo('Custom Resources', EXTENSION_DISPLAY_NAME);

    cy.clickGenericListLink(CR_NAME);

    cy.contains(FIRST_DESCRIPTION);
    cy.should('not.contain.text', SECOND_DETAIL);
  });

  it('Edit extension', () => {
    cy.navigateTo('Configuration', 'Extensions');

    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .wait(1000)
      .clear()
      .type(EXTENSION_NAME)
      .get('ui5-li-suggestion-item:visible')
      .contains(EXTENSION_NAME)
      .click();

    cy.clickGenericListLink(EXTENSION_NAME);

    cy.getMidColumn().inspectTab('Edit');

    cy.get('.edit-form').as('form');

    cy.loadFiles(
      'examples/extensions/configuration/potatoes-updates-details-view.yaml',
    ).then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');

      cy.get('@form')
        .get('[data-testid="details-view"]')
        .scrollIntoView()
        .within(() => {
          cy.pasteToMonaco(input);
        });
    });

    cy.saveChanges('Edit');
    cy.reload(); //Reload is needed to load new extension
  });

  it('Check if extension is updated and displayed correctly', () => {
    cy.navigateTo('Custom Resources', EXTENSION_DISPLAY_NAME);

    cy.clickGenericListLink(CR_NAME);

    cy.contains(UPDATED_DESCRIPTION);
    cy.contains(SECOND_DETAIL);

    cy.getLeftNav()
      .contains('Cluster Details')
      .click();
  });
});
