/// <reference types="cypress" />
import config from '../config';

const ADDRESS = config.localDev
    ? `http://localhost:4200`
    : `https://busola.${config.domain}`;

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    debugger
    return false
})

context('Busola Login Failed', () => {
    before(() => {
        cy.clearSessionStorage().clearLocalStorage();

        cy.visit(ADDRESS)
            .get('#textarea-kubeconfig')
            .type('abc')
            .get('#apply-kubeconfig')
            .click()
            .handleInvalidLoginData();
    });
});