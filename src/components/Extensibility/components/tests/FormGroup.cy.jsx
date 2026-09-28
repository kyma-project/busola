/* global cy, describe, it */
import { FormGroup } from '../FormGroup';
import { ExtensibilityTestWrapper } from './helpers';

describe('FormGroup Component', () => {
  it('renders the group header from structure.name', () => {
    const structure = { name: 'JKS', children: [] };

    cy.mount(
      <ExtensibilityTestWrapper>
        <FormGroup structure={structure} value={{}} />
      </ExtensibilityTestWrapper>,
    );

    cy.get('ui5-form-group').should('have.attr', 'header-text', 'JKS');
  });

  it('renders one form item per child', () => {
    const structure = {
      name: 'JKS',
      children: [
        { name: 'spec.keystores.create', source: 'spec.keystores.jks.create' },
        {
          name: 'spec.keystores.passwordSecretRef',
          source: 'spec.keystores.jks.passwordSecretRef.name',
        },
      ],
    };
    const value = {
      spec: {
        keystores: {
          jks: { create: 'true', passwordSecretRef: { name: 'my-secret' } },
        },
      },
    };

    cy.mount(
      <ExtensibilityTestWrapper>
        <FormGroup structure={structure} value={value} />
      </ExtensibilityTestWrapper>,
    );

    cy.get('ui5-form-item').should('have.length', 2);
  });

  it('renders no form items when structure has no children', () => {
    const structure = { name: 'Empty Group' };

    cy.mount(
      <ExtensibilityTestWrapper>
        <FormGroup structure={structure} value={{}} />
      </ExtensibilityTestWrapper>,
    );

    cy.get('ui5-form-group').should('exist');
    cy.get('ui5-form-item').should('not.exist');
  });
});
