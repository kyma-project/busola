/* global cy */
import SecretData from '../SecretData';

describe('SecretData Component', () => {
  const secret = {
    data: {
      client_id: btoa('client-id'),
      client_secret: btoa('client-secret'),
    },
  };

  const empty_secret = {};

  const mountComponent = secretProp => {
    cy.mount(<SecretData secret={secretProp} />);
  };

  const expectInitialState = () => {
    cy.get('pre.secret')
      .filter(':contains("*****")')
      .should('have.length', 2);

    cy.contains(secret.data.client_id).should('not.exist');
    cy.contains(secret.data.client_secret).should('not.exist');
    cy.contains(btoa(secret.data.client_id)).should('not.exist');
    cy.contains(btoa(secret.data.client_secret)).should('not.exist');
  };

  const expectDecodedState = () => {
    cy.contains(atob(secret.data.client_id)).should('be.visible');
    cy.contains(atob(secret.data.client_secret)).should('be.visible');

    cy.contains(secret.data.client_id).should('not.exist');
    cy.contains(secret.data.client_secret).should('not.exist');
  };

  const expectEncodedState = () => {
    cy.contains(secret.data.client_id).should('be.visible');
    cy.contains(secret.data.client_secret).should('be.visible');

    cy.contains(btoa(secret.data.client_id)).should('not.exist');
    cy.contains(btoa(secret.data.client_secret)).should('not.exist');
  };

  it('Renders header', () => {
    mountComponent(secret);
    cy.contains('secrets.data').should('be.visible');
  });

  it('Decodes and encodes secret values', () => {
    mountComponent(secret);

    expectInitialState();

    cy.contains('secrets.buttons.decode')
      .first()
      .click();

    expectDecodedState();

    cy.contains('secrets.buttons.encode')
      .first()
      .click();

    expectEncodedState();
  });

  it('Renders secret not found', () => {
    mountComponent(null);
    cy.contains('secrets.secret-not-found').should('be.visible');
  });

  it('Renders empty secret', () => {
    mountComponent(empty_secret);
    cy.contains('secrets.secret-empty').should('be.visible');
  });
});
