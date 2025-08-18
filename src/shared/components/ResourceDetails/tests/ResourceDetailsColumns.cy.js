/* global cy */
import { ResourceDetails } from '../ResourceDetails';
import { authDataAtom } from 'state/authDataAtom';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

describe('ResourceDetails Columns', () => {
  it('Renders basic column', () => {
    cy.intercept('GET', '**test-resource-url**', {
      statusCode: 200,
      body: {
        kind: 'TestKind',
        metadata: {
          name: 'test-resource-name',
          namespace: 'test-resource-namespace',
        },
      },
    });

    const initializeJotai = [
      [
        authDataAtom,
        {
          token: 'test-token',
        },
      ],
    ];

    cy.mount(
      <ResourceDetails
        resourceUrl="test-resource-url"
        resourceType="test-resource-type"
        customColumns={[
          {
            header: 'some-header',
            value: resource =>
              `${resource.metadata.name} | ${resource.metadata.namespace}`,
          },
        ]}
      />,
      {
        initializeJotai,
      },
    );

    cy.contains('some-header:', { timeout: 10000 }).should('exist');
    cy.contains('test-resource-name | test-resource-namespace', {
      timeout: 10000,
    }).should('exist');
  });
});
