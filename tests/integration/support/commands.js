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

Cypress.Commands.add('filterWithNoValue', { prevSubject: true }, $elements =>
  $elements.filter((_, e) => !e.value),
);

Cypress.Commands.add('goToNamespaceDetails', () => {
  // Go to the details of namespace
  cy.getLeftNav()
    .contains('Namespaces')
    .click();

  cy.get('[role=row]')
    .contains('a', Cypress.env('NAMESPACE_NAME'))
    .click();

  return cy.end();
});

Cypress.Commands.add('clearInput', { prevSubject: true }, element => {
  return cy
    .wrap(element)
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
  return cy.get('aside.sidebar');
});

Cypress.Commands.add('getTopNav', () => {
  return cy.get('.fd-shellbar');
});

Cypress.Commands.add('deleteInDetails', () => {
  cy.contains('button', 'Delete').click();

  cy.get('[data-testid="delete-confirmation"]').click();

  cy.contains(/deleted/).should('be.visible');
});

Cypress.Commands.add(
  'deleteFromGenericList',
  (searchTerm, confirmationEnabled = true, deletedVisible = true) => {
    cy.get('[aria-label="open-search"]').click();

    cy.get('[placeholder="Search"]').type(searchTerm);

    cy.contains(searchTerm).should('be.visible');

    cy.get('[aria-label="Delete"]').click();

    if (confirmationEnabled) {
      cy.contains('button', 'Delete').click();
      if (deletedVisible) {
        cy.contains(/deleted/).should('be.visible');
      }

      cy.contains(searchTerm).should('not.exist');
    }
  },
);
