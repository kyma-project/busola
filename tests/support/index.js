import './commands';
import './iframe-commands';
import './login-commands';
import './views/api-rules-view';
import './views/functions-view';

Cypress.on('window:before:load', win => {
  cy.spy(win.console, 'error');
  cy.spy(win.console, 'warn');
});
