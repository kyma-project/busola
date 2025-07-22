/// <reference types="cypress" />
import 'cypress-file-upload';

const config__noFeedback = {
  data: {
    config: JSON.stringify({
      config: {
        features: {
          FEEDBACK: {
            isEnabled: false,
          },
          KYMA_COMPANION: {
            isEnabled: false,
          },
        },
      },
    }),
  },
};

const config__onlyKymaFeedback = {
  data: {
    config: JSON.stringify({
      config: {
        features: {
          FEEDBACK: {
            isEnabled: true,
            link: 'https://www.google.com/',
          },
        },
      },
    }),
  },
};

const config__KymaAndJouleFeedback = {
  data: {
    config: JSON.stringify({
      config: {
        features: {
          FEEDBACK: {
            isEnabled: true,
            link: 'https://www.google.com/',
          },
          KYMA_COMPANION: {
            isEnabled: true,
            config: {
              feedbackLink: 'https://kyma-project.io/',
            },
          },
        },
      },
    }),
  },
};

const configRequest = {
  method: 'GET',
  url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
};

context('Test Feedback Popover', () => {
  Cypress.skipAfterFail();

  it('Test feedback disabled', () => {
    cy.intercept(configRequest, config__noFeedback);
    cy.loginAndSelectCluster();

    cy.get('ui5-shellbar')
      .find('ui5-button[icon="feedback"]')
      .should('not.exist');
  });

  it('Test feedback enabled, companion disabled', () => {
    cy.intercept(configRequest, config__onlyKymaFeedback);
    cy.loginAndSelectCluster();

    cy.wait(2000);

    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.get('ui5-shellbar')
      .find('ui5-button[icon="feedback"]')
      .as('opener')
      .should('be.visible');

    cy.get('@opener')
      .find('ui5-button-badge[text="1"]')
      .should('not.exist');

    cy.get('@opener').click();

    cy.get('ui5-popover[class="feedbackPopover"]')
      .should('be.visible')
      .should('contain.text', 'Hello,')
      .should('contain.text', "Tell us what's on your mind")
      .should('contain.text', 'Kyma Dashboard Feedback')
      .should('not.contain.text', 'Joule Feedback')
      .should('not.contain.text', 'New')
      .find('ui5-button[design="Emphasized"]')
      .should('be.visible')
      .should('contain.text', 'Give Feedback')
      .click();

    cy.get('@windowOpen').should('be.calledWith', 'https://www.google.com/');
  });

  it('Test feedback enabled, companion enabled', () => {
    cy.intercept(configRequest, config__KymaAndJouleFeedback);
    cy.loginAndSelectCluster();

    cy.wait(2000);

    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.get('ui5-shellbar')
      .find('ui5-button[icon="feedback"]')
      .as('opener')
      .should('be.visible');

    cy.get('@opener')
      .find('ui5-button-badge[text="1"]')
      .should('be.visible');

    cy.get('@opener').click();

    cy.get('ui5-popover[class="feedbackPopover"]')
      .should('be.visible')
      .as('popover');

    cy.get('@popover')
      .should('contain.text', 'Hello,')
      .should('contain.text', "Tell us what's on your mind")
      .should('contain.text', 'Kyma Dashboard Feedback')
      .should('contain.text', 'Joule Feedback')
      .should('contain.text', 'New')
      .find('ui5-button[design="Emphasized"]')
      .should('be.visible')
      .should('contain.text', 'Give Feedback')
      .click();

    cy.get('@windowOpen').should('be.calledWith', 'https://kyma-project.io/');

    cy.get('@opener')
      .find('ui5-button-badge[text="1"]')
      .should('not.exist');

    cy.get('@popover').should('not.contain.text', 'New');

    cy.get('@popover')
      .find('ui5-button[design="Default"]')
      .should('be.visible')
      .should('contain.text', 'Give Feedback')
      .click();

    cy.get('@windowOpen').should('be.calledWith', 'https://www.google.com/');
  });
});
