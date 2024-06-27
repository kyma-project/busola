import { chooseComboboxOption } from '../../support/helpers';
import jsyaml from 'js-yaml';

const EXTENSION_NAME = 'Potato Extension';
const CR_NAME = 'first-potato';
const FIRST_DESCRIPTION = 'My Description';

context('Test Potatoes', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();

    cy.loginAndSelectCluster();

    // cy.createNamespace('potatoes');
  });

  it.skip('Creates the EXT potatoes config', () => {
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.loadFiles(
      'examples/extensions/configuration/potatoes-crd.yaml',
      'examples/extensions/samples/potato.yaml',
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

    // cy.get('ui5-button')
    //   .find('Close')
    //   .should('be.visible')
    //   .click();
    cy.loginAndSelectCluster();
  });

  it.skip('Create Extensions', () => {
    cy.navigateTo('Configuration', 'Extensions');

    cy.openCreate();

    chooseComboboxOption('[id="combobox-input"]', 'potato');

    cy.get('ui5-input[value=Potatoes]')
      .find('input')
      .clear()
      .type(EXTENSION_NAME);

    cy.get('[aria-label="expand Details Summary"]').click();
    cy.get('ui5-panel[data-testid=details-summary]').within(() => {
      cy.get('ui5-input[value="description"]')
        .debug()
        .find('input')
        .clear()
        .type(FIRST_DESCRIPTION);

      // TODO: use datatestid
      cy.get('ui5-checkbox')
        .last()
        .click();
    });

    cy.saveChanges('Create');
  });

  it.skip('Check if Extensions is created', () => {
    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .clear()
      .type('potatoes')
      .get('ui5-li-suggestion-item:visible')
      .contains('potatoes')
      .click();

    cy.get('ui5-table-row')
      .contains('potatoes')
      .should('be.visible');
  });

  it.skip('Check extension view', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .wait(1000)
      .type('potatoes');

    cy.clickGenericListLink('potatoes');

    //TODO: Consider to use this in navigateTo
    cy.getLeftNav()
      .get('ui5-side-navigation-item[text="Custom Resources"]')
      .click();

    cy.getLeftNav()
      .get(`ui5-side-navigation-sub-item[text="${EXTENSION_NAME}"]`)
      .click();

    cy.clickGenericListLink(CR_NAME);

    cy.contains(FIRST_DESCRIPTION);
    cy.should('not.contain.text', 'weight');

    cy.getLeftNav()
      .contains('Back To Cluster Details')
      .click();
  });

  it('Edit extension', () => {
    cy.getLeftNav()
      .get('ui5-side-navigation-item[text="Configuration"]')
      .click();

    cy.getLeftNav()
      .get(`ui5-side-navigation-sub-item[text="Extensions"]`)
      .click();

    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .clear()
      .type('potatoes')
      .get('ui5-li-suggestion-item:visible')
      .contains('potatoes')
      .click();

    cy.clickGenericListLink('potatoes');

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
});
