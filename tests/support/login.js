before(() => {});

beforeEach(() => {
  cy.restoreLocalStorageCache();
});

afterEach(() => {
  cy.saveLocalStorageCache();
});
