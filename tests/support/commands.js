Cypress.Commands.overwrite('log', (_, message) => cy.task('log', message));

Cypress.Commands.add('clearSessionStorage', () =>
  cy.window().then(win => win.sessionStorage.clear()),
);

Cypress.Commands.add('handleInvalidLoginData', () => {
  const loginErrorAlert = Cypress.$('#error');
  if (loginErrorAlert.length !== 0) {
    throw Error(`Login failed with message: ${loginErrorAlert.text()}`);
  }
  return cy.end();
});

Cypress.Commands.add(
  'shouldHaveTrimmedText',
  { prevSubject: true },
  (subject, equalTo) => {
    expect(subject.text().trim()).to.eq(equalTo);
    return subject;
  },
);
