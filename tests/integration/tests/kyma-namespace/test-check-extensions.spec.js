/// <reference types="cypress" />
import { useCategory } from '../../support/helpers';

context('Test Namespace Extensions view', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  // Workloads
  describe('Test Workloads Extensions', () => {
    useCategory('Workloads');

    it('Test Functions', () => {
      cy.checkExtension('Functions');
    });
  });

  // Discovery and Network
  describe('Check Discovery and Network Extensions', () => {
    useCategory('Discovery and Network');

    it('Test API Rules', () => {
      cy.checkExtension('API Rules');
    });

    it('Test Horizontal Pod Autoscalers', () => {
      cy.checkExtension('Horizontal Pod Autoscalers');
    });

    it('Test Services', () => {
      cy.checkExtension('Services');
    });
  });

  // Configuration
  describe('Check Configuration Extensions', () => {
    useCategory('Configuration');

    it('Test Certificates', () => {
      cy.checkExtension('Certificates');
    });

    it('Test DNS Entries', () => {
      cy.checkExtension('DNS Entries');
    });

    it('Test DNS Providers', () => {
      cy.checkExtension('DNS Providers');
    });

    it('Test Issuers', () => {
      cy.checkExtension('Issuers');
    });

    // uncomment after kyma deploy command fix
    it('Test Subscriptions', () => {
      cy.checkExtension('Subscriptions');
    });

    it('Test OAuth2 Clients', () => {
      cy.checkExtension('OAuth2 Clients');
    });
  });
});
