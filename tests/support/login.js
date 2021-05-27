import config from '../config';
const env = Cypress.env();

const NAMESPACE_NAME = config.namespace;

before(() => {
  cy.loginAndSelectCluster();
});

beforeEach(() => {
  cy.restoreLocalStorageCache();
  // cy.restoreURL();
});

afterEach(() => {
  // cy.saveURL();
  cy.saveLocalStorageCache();
});
