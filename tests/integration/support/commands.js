import 'cypress-file-upload';

Cypress.skipAfterFail = ({ skipAllSuits = false } = {}) => {
  before(function() {
    // stop all if an important test failed before
    cy.task('dynamicSharedStore', { name: 'cancelTests' }).then(
      hasImportantTestFallen => {
        if (hasImportantTestFallen) {
          Cypress.runner.stop();
        }
      },
    );
  });
  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      if (!Cypress.config('isInteractive')) {
        // isInteractive is true for headed browsers (suite started with 'cypress open' command)
        // and false for headless ('cypress run')
        // This will skip remaining test in the current context when a test fails.
        Cypress.runner.stop();
      }
      if (skipAllSuits) {
        cy.task('dynamicSharedStore', {
          name: 'cancelTests',
          value: true,
        }).then(() => {
          cy.log('Skipping all remaining tests');
        });
      }
    }
  });
};

Cypress.Commands.add(
  'shouldHaveTrimmedText',
  { prevSubject: true },
  (subject, equalTo) => {
    expect(subject.text().trim()).to.eq(equalTo);
    return subject;
  },
);

Cypress.Commands.add('clickGenericListLink', resourceName => {
  cy.get('ui5-table-row')
    .find('ui5-table-cell')
    .find('ui5-link')
    .contains(resourceName)
    .find('a.ui5-link-root')
    .click({ force: true });
});

Cypress.Commands.add('filterWithNoValue', { prevSubject: true }, $elements =>
  $elements.filter((_, e) => !e.value),
);

Cypress.Commands.add('goToNamespaceDetails', () => {
  // Go to the details of namespace
  cy.getLeftNav()
    .contains('Namespaces')
    .click();

  cy.clickGenericListLink(Cypress.env('NAMESPACE_NAME'));

  return cy.end();
});

Cypress.Commands.add('clearInput', { prevSubject: true }, element => {
  return cy
    .wrap(element)
    .click()
    .type(
      `${Cypress.platform === 'darwin' ? '{cmd}a' : '{ctrl}a'} {backspace}`,
    );
});

/**
 * Simulates a paste event.
 *
 * @example
 * cy.get('some-selector').paste({
 *  pastePayload: 'String example'
 *  });
 */
Cypress.Commands.add(
  'paste',
  {
    prevSubject: true,
  },
  paste,
);

/**
 * Simulates a paste event.
 *
 * @param subject A jQuery context representing a DOM element.
 * @param pastePayload Simulated String that is on the clipboard.
 *
 * @returns The subject parameter.
 */
function paste(subject, { pastePayload }) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
  const pasteEvent = Object.assign(
    new Event('paste', { bubbles: true, cancelable: true }),
    {
      clipboardData: {
        getData: (type = 'text') => pastePayload,
      },
    },
  );
  subject[0].dispatchEvent(pasteEvent);

  return subject;
}

Cypress.Commands.add('getLeftNav', () => {
  return cy.get('aside');
});

Cypress.Commands.add('getMidColumn', () => {
  return cy.get('div[slot="midColumn"]');
});

Cypress.Commands.add('getEndColumn', () => {
  return cy.get('div[slot="endColumn"]');
});

Cypress.Commands.add(
  'deleteInDetails',
  (resourceType, resourceName, columnLayout = false) => {
    if (columnLayout) {
      cy.getMidColumn()
        .contains('ui5-button', 'Delete')
        .should('be.visible')
        .click();
    } else {
      cy.get('ui5-button')
        .contains('Delete')
        .should('be.visible')
        .click();
    }

    cy.contains(`delete ${resourceType} ${resourceName}`);

    cy.get(`[header-text="Delete ${resourceType}"]:visible`)
      .find('[data-testid="delete-confirmation"]')
      .click();

    cy.contains(/deleted/).should('be.visible');

    cy.getMidColumn().should('not.be.visible');
  },
);

Cypress.Commands.add(
  'deleteFromGenericList',
  (
    resourceType,
    resourceName,
    confirmationEnabled = true,
    deletedVisible = true,
    clearSearch = true,
    isUI5Link = true,
  ) => {
    cy.get('[aria-label="open-search"]:visible').click();

    cy.get('ui5-combobox[placeholder="Search"]:visible')
      .find('input')
      .click()
      .type(resourceName);

    if (isUI5Link) {
      cy.contains('ui5-link', resourceName).should('be.visible');
    } else {
      cy.contains('a', resourceName).should('be.visible');
    }

    cy.contains('ui5-message-strip', /created/).should('not.exist');

    cy.get('ui5-button[data-testid="delete"]').click();

    if (confirmationEnabled) {
      cy.contains(`delete ${resourceType} ${resourceName}`);

      cy.get(`[header-text="Delete ${resourceType}"]:visible`)
        .find('[data-testid="delete-confirmation"]')
        .click();

      if (deletedVisible) {
        cy.contains('ui5-message-strip', /deleted/).should('be.visible');
      }

      if (clearSearch) {
        cy.get('ui5-combobox[placeholder="Search"]:visible')
          .find('input')
          .click()
          .clear();
      }

      cy.get('ui5-table')
        .contains(resourceName)
        .should('not.exist');
    }
  },
);

Cypress.Commands.add('changeCluster', clusterName => {
  cy.get('header')
    .find('[aria-haspopup="menu"]:visible')
    .click({ force: true });

  cy.get('ui5-list')
    .find(`[aria-label="${clusterName}"]:visible`)
    .find('span[part="title"]')
    .click({ force: true });
});

Cypress.Commands.add('testMidColumnLayout', resourceName => {
  cy.getMidColumn()
    .find('ui5-button[aria-label="full-screen"]')
    .click();

  cy.contains('ui5-link', resourceName).should('not.be.visible');

  cy.getMidColumn()
    .find('ui5-button[aria-label="close-full-screen"]')
    .click();

  cy.contains('ui5-link', resourceName).should('be.visible');

  cy.closeMidColumn();

  cy.getMidColumn()
    .contains('ui5-title', resourceName)
    .should('not.be.visible');
});

Cypress.Commands.add('testEndColumnLayout', resourceName => {
  cy.getEndColumn()
    .find('ui5-button[aria-label="full-screen"]')
    .click();

  cy.contains('ui5-link', resourceName).should('not.be.visible');

  cy.getEndColumn()
    .find('ui5-button[aria-label="close-full-screen"]')
    .click();

  cy.contains('ui5-link', resourceName).should('be.visible');

  cy.getEndColumn()
    .find('ui5-button[aria-label="close-column"]')
    .click();

  cy.getEndColumn().should('not.be.visible');

  cy.getEndColumn()
    .contains('ui5-title', resourceName)
    .should('not.be.visible');
});

Cypress.Commands.add('closeMidColumn', () => {
  cy.getMidColumn()
    .find('ui5-button[aria-label="close-column"]')
    .click();

  cy.getMidColumn().should('not.be.visible');
});

Cypress.Commands.add('closeEndColumn', () => {
  cy.getEndColumn()
    .find('ui5-button[aria-label="close-column"]')
    .click();

  cy.getEndColumn().should('not.be.visible');
});
