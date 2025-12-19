/* global cy, describe, it */
import { ResourceLink } from '../ResourceLink';

describe('ResourceLink', () => {
  const value = 'link-to-resource';
  const originalResource = {
    name: 'original-resource-name',
    namespace: 'original-resource-namespace',
    kind: 'original-resource.kind',
  };

  it('Renders placeholder for no value', () => {
    cy.mount(<ResourceLink structure={{ placeholder: 'empty!' }} />);

    cy.contains('empty!').should('be.visible');
  });

  it('Accepts config without namespace', () => {
    cy.mount(
      <ResourceLink
        value={value}
        structure={{
          source: '$root.name',
          resource: {
            name: '$root.name',
            kind: '$root.kind',
          },
        }}
        originalResource={originalResource}
      />,
    );

    cy.contains(`${value}`).should('exist');
  });

  it('Show error on invalid config', () => {
    cy.mount(
      <ResourceLink
        value={value}
        structure={{ resource: { namespace: '$notExistingMethod()' } }}
        originalResource={originalResource}
      />,
    );

    cy.contains('extensibility.configuration-error').should('be.visible');
  });
});
