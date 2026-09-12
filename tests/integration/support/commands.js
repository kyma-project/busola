import 'cypress-file-upload';

Cypress.skipAfterFail = ({ skipAllSuits = false } = {}) => {
  before(function () {
    // stop all if an important test failed before
    cy.task('dynamicSharedStore', { name: 'cancelTests' }).then(
      (hasImportantTestFallen) => {
        if (hasImportantTestFallen) {
          Cypress.runner.stop();
        }
      },
    );
  });
  afterEach(function () {
    if (this.currentTest.state === 'failed') {
      const retriesRemaining =
        (this.currentTest._retries ?? 0) -
        (this.currentTest.currentRetry() ?? 0);
      if (!Cypress.config('isInteractive') && retriesRemaining === 0) {
        // isInteractive is true for headed browsers (suite started with 'cypress open' command)
        // and false for headless ('cypress run')
        // This will skip remaining test in the current context when a test fails.
        Cypress.runner.stop();
      }
      if (skipAllSuits && retriesRemaining === 0) {
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

Cypress.Commands.add('checkItemOnGenericListLink', (resourceName) => {
  cy.contains('ui5-table-row', resourceName).should('be.visible');
});

Cypress.Commands.add('clickGenericListLink', (resourceName) => {
  cy.get('ui5-table-row')
    .find('ui5-table-cell')
    .contains('ui5-text', resourceName)
    .click();
});

Cypress.Commands.add('clickListLink', (resourceName) => {
  cy.get('ui5-table-row')
    .find('ui5-table-cell')
    .contains('ui5-link', resourceName)
    .click();
});

Cypress.Commands.add('filterWithNoValue', { prevSubject: true }, ($elements) =>
  $elements.filter((_, e) => !e.value),
);

Cypress.Commands.add('goToNamespaceDetails', (namespace) => {
  const name = namespace ?? Cypress.env('NAMESPACE_NAME');

  cy.getLeftNav()
    .find('ui5-side-navigation-item')
    .contains('Namespaces')
    .should('be.visible')
    .click();

  // confirm we left the overview before clicking a row, else clickListLink hits a stale link
  cy.location('pathname').should('match', /\/namespaces$/);

  cy.clickListLink(name);

  // wait for the namespace detail route to commit; a following navigateTo otherwise
  // runs against the cluster-scope sidebar where sub-items like Roles don't exist yet
  cy.location('pathname').should('match', new RegExp(`/namespaces/${name}$`));

  // the URL flips before the namespace view mounts, so also wait for that scope to be up:
  // both the "Namespace Overview" sidebar item and the page title only exist here. Without
  // this a following navigateTo races the sidebar transition and finds its sub-item at 0x0.
  cy.getLeftNav()
    .get('ui5-side-navigation-item[text="Namespace Overview"]')
    .should('be.visible');

  cy.contains('ui5-title', 'Namespace Overview').should('be.visible');

  return cy.end();
});

Cypress.Commands.add('clearInput', { prevSubject: true }, (element) => {
  return cy
    .wrap(element)

    .type(
      `${Cypress.platform === 'darwin' ? '{cmd}a' : '{ctrl}a'} {backspace}`,
      { force: true },
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
    new Event('paste', { bubbles: true, cancelable: false }),
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

Cypress.Commands.add('getStartColumn', () => {
  return cy.get('div[slot="startColumn"]');
});

Cypress.Commands.add('getMidColumn', () => {
  return cy.get('div[slot="midColumn"]');
});

Cypress.Commands.add('getEndColumn', () => {
  return cy.get('div[slot="endColumn"]');
});

Cypress.Commands.add(
  'deleteInDetails',
  (resourceType, resourceName, columnLayout = false, options = {}) => {
    const { customHeaderText = null } = options;
    const headerText = customHeaderText || `Delete ${resourceType}`;

    if (columnLayout) {
      cy.getMidColumn()
        .contains('ui5-button', 'Delete')
        .should('be.visible')
        .click();
    } else {
      cy.get('ui5-button').contains('Delete').should('be.visible').click();
    }

    cy.contains(customHeaderText || `Delete ${resourceType} ${resourceName}`);

    cy.get(`[header-text="${headerText}"]:visible`)
      .find('[data-testid="delete-confirmation"]')
      .click();

    // the toast auto-dismisses after 3s, racing a visibility assert; its text stays in the DOM
    cy.contains(/set for deletion/, { timeout: 30000 }).should('exist');

    cy.getMidColumn().should('not.be.visible');
  },
);

Cypress.Commands.add(
  'deleteFromGenericList',
  (resourceType, resourceName, options = {}) => {
    const {
      confirmationEnabled = true,
      deletedVisible = true,
      clearSearch = true,
      checkIfResourceIsRemoved = true,
      selectSearchResult = false,
      searchInPlainTableText = false,
      parentSelector = null,
      waitForDelete = 0,
      customHeaderText = null,
    } = options;

    // clearing re-renders the list and can detach the input; re-query before typing
    const searchInput = () =>
      parentSelector
        ? cy
            .get(parentSelector)
            .find('ui5-input[id^=search-]:visible')
            .find('input')
        : cy.get('ui5-input[id^=search-]:visible').find('input');

    searchInput()
      .should('not.have.attr', 'disabled', { timeout: 5000 })
      .clear({ force: true });
    searchInput().type(resourceName, { force: true });

    if (selectSearchResult) {
      cy.get('ui5-suggestion-item')
        .contains('li', resourceName)
        .click({ force: true });
    }

    if (searchInPlainTableText) {
      //  TODO: Modules in tests are unmannaged and text is not in ui5-text component
      cy.get('ui5-table-row')
        .find('ui5-table-cell')
        .contains(resourceName)
        .should('be.visible');
    } else {
      cy.checkItemOnGenericListLink(resourceName);
    }

    if (parentSelector) {
      cy.get(parentSelector)
        .find('ui5-button[data-testid="delete"]:visible')
        .click();
    } else {
      cy.contains('ui5-table-row', resourceName)
        .find('ui5-button[data-testid="delete"]')
        .click();
    }

    if (confirmationEnabled) {
      const headerText = customHeaderText || `Delete ${resourceType}`;
      cy.contains(customHeaderText || `Delete ${resourceType} ${resourceName}`);

      // TODO: This wait allows 'community modules add/edit/delete' to download needed resources to apply from backend.
      // The download is initiated when user mark module to install and then when user click delete, it deleted what is was able to download
      if (waitForDelete !== 0) {
        cy.wait(waitForDelete);
      }

      cy.get(`[header-text="${headerText}"]:visible`)
        .find('[data-testid="delete-confirmation"]')
        .click();

      if (deletedVisible) {
        cy.contains('ui5-toast', /set for deletion/, { timeout: 30000 }).should(
          'exist',
        );
      }

      if (checkIfResourceIsRemoved) {
        cy.get('ui5-table').contains(resourceName).should('not.exist');
      }
    }

    if (clearSearch) {
      if (parentSelector) {
        cy.get(parentSelector)
          .find('ui5-input[id^=search-]:visible')
          .find('input')
          .clear();
      } else {
        cy.get('ui5-input[id^=search-]:visible').find('input').clear();
      }
    }
  },
);

Cypress.Commands.add('changeCluster', (clusterName) => {
  cy.get('ui5-shellbar').find('#clusterSwitcherOpener').click();

  cy.get(`ui5-menu-item[accessible-name="${clusterName}"]:visible`)
    .find('li[part="native-li"]')
    .click({
      force: true,
    });
});

Cypress.Commands.add(
  'testMidColumnLayout',
  (resourceName, checkIfNotExist = true) => {
    cy.getMidColumn()
      .find('ui5-button[accessible-name="enter-full-screen"]')
      .click();

    cy.get('ui5-table-row')
      .find('ui5-table-cell')
      .contains('ui5-text', resourceName)
      .should('not.be.visible');

    cy.getMidColumn()
      .find('ui5-button[accessible-name="close-full-screen"]')
      .click();

    cy.checkItemOnGenericListLink(resourceName);

    cy.closeMidColumn(checkIfNotExist);
  },
);

Cypress.Commands.add(
  'testEndColumnLayout',
  (resourceName, checkIfNotExist = true) => {
    cy.getEndColumn()
      .find('ui5-button[accessible-name="enter-full-screen"]')
      .click();

    cy.get('ui5-table-row')
      .find('ui5-table-cell')
      .contains('ui5-text', resourceName)
      .should('not.be.visible');

    cy.getEndColumn()
      .find('ui5-button[accessible-name="close-full-screen"]')
      .click();

    cy.checkItemOnGenericListLink(resourceName);

    cy.closeEndColumn(checkIfNotExist);
  },
);

Cypress.Commands.add(
  'closeMidColumn',
  (checkIfNotExist = false, hiddenButtons = false) => {
    if (hiddenButtons) {
      cy.getMidColumn()
        .find('header')
        .find('ui5-toggle-button:visible')
        .click();

      cy.get('[data-component-name="ToolbarOverflowPopoverContent"]')
        .find('ui5-button[accessible-name="close-column"]')
        .click();
    } else
      cy.getMidColumn()
        .find('ui5-button[accessible-name="close-column"]')
        .click();

    if (checkIfNotExist) cy.getMidColumn().should('not.exist');
    else cy.getMidColumn().should('not.be.visible');
  },
);

Cypress.Commands.add('closeEndColumn', (checkIfNotExist = false) => {
  cy.getEndColumn().find('ui5-button[accessible-name="close-column"]').click();

  if (checkIfNotExist) cy.getEndColumn().should('not.exist');
  else cy.getEndColumn().should('not.be.visible');
});

Cypress.Commands.add('typeInSearch', (searchPhrase, force = false) => {
  // UI5 re-templates the inner <input> during list re-renders (create refetch, extension-load
  // storm), so re-query between clear and type to avoid "page updated while command was executing"
  const searchInput = () =>
    cy.get('ui5-input[id^=search-]:visible').find('input');

  searchInput().should('be.visible').should('not.be.disabled').clear({ force });
  searchInput().type(searchPhrase, { force });
});

Cypress.Commands.add('openSettingsMenu', () => {
  cy.get('[tooltip="User Menu"]').click({ force: true });

  cy.get('ui5-menu-item:visible').contains('Settings').click({ force: true });
});
