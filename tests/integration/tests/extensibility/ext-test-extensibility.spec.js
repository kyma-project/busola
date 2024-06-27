import { chooseComboboxOption } from '../../support/helpers';
import jsyaml from 'js-yaml';

const EXTENSION_NAME = 'Potato Extension';
const NAMESPACE_NAME = 'potato';
const CR_NAME = 'first-potato';
const FIRST_DESCRIPTION = 'My Description';
const UPDATED_DESCRIPTION = 'Updated description';
const SECOND_DETAIL = 'weight';

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

    cy.loadFiles(
      'examples/extensions/configuration/potatoes-crd.yaml',
      'examples/extensions/configuration/namespace.yaml',
    ).then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog[header-text="Upload YAML"]')
      .find('.status-message-success')
      .should('have.length', 2);

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

    cy.get('ui5-input[value=Potatoes]')
      .find('input')
      .clear()
      .type(EXTENSION_NAME);

    cy.get('[aria-label="expand Details Summary"]').click();
    cy.get('ui5-panel[data-testid="details-summary"]').within(() => {
      cy.get('ui5-input[value="description"]')
        .debug()
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
      .type('potatoes')
      .get('ui5-li-suggestion-item:visible')
      .contains('potatoes')
      .click();

    cy.get('ui5-table-row')
      .contains('potatoes')
      .should('be.visible');
  });

  it('Check if extension is displayed correctly', () => {
    cy.reload(); //Reload is needed to load new extension

    cy.getLeftNav()
      .get('ui5-side-navigation-item[text="Namespaces"]')
      .click();

    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .wait(1000)
      .clear()
      .type(NAMESPACE_NAME);

    cy.clickGenericListLink(NAMESPACE_NAME);

    cy.navigateTo('Custom Resources', EXTENSION_NAME);

    cy.clickGenericListLink(CR_NAME);

    cy.contains(FIRST_DESCRIPTION);
    cy.should('not.contain.text', SECOND_DETAIL);

    cy.getLeftNav()
      .contains('Back To Cluster Details')
      .click();
  });

  it('Edit extension', () => {
    cy.navigateTo('Configuration', 'Extensions');

    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .wait(1000)
      .clear()
      .type('potatoes')
      .get('ui5-li-suggestion-item:visible')
      .contains('potatoes')
      .click();

    cy.clickGenericListLink(NAMESPACE_NAME);

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
  });

  it('Check if extension is updated and displayed correctly', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .wait(1000)
      .clear()
      .type(NAMESPACE_NAME);

    cy.clickGenericListLink(NAMESPACE_NAME);

    cy.getLeftNav()
      .get('ui5-side-navigation-item[text="Custom Resources"]')
      .click();

    cy.getLeftNav()
      .get(`ui5-side-navigation-sub-item[text="${EXTENSION_NAME}"]`)
      .click();

    cy.clickGenericListLink(CR_NAME);

    cy.contains(UPDATED_DESCRIPTION);
    cy.contains(SECOND_DETAIL);

    cy.getLeftNav()
      .contains('Back To Cluster Details')
      .click();
  });
});
