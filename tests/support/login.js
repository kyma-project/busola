beforeEach(() => {
  cy.restoreLocalStorageCache();
});

afterEach(() => {
  cy.saveLocalStorageCache();
});
