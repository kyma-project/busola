/// <reference types="cypress" />
import { useCategory } from '../../support/helpers';

context('Test Cluster Extensions views', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.reload();
    cy.wait(1000);
  });

  // Telemetry
  describe('Test Telemetry Extensions', () => {
    useCategory('Telemetry');

    it('Test Trace Pipelines', () => {
      cy.checkExtension('Trace Pipelines');
    });

    it('Test Log Pipelines', () => {
      cy.checkExtension('Log Pipelines');
    });
  });
});
