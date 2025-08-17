/* global cy */
import { ResourceDetails } from '../ResourceDetails';
import { authDataState } from 'state/authDataAtom';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

describe('ResourceDetails visibility', () => {
  it('Column visibility', () => {
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
        authDataState,
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
            header: 'some-header--hidden',
            value: () => 'should not be visible',
            visibility: () => ({ visible: false }),
          },
          {
            header: 'some-header--visible',
            value: () => 'should be visible',
            visibility: () => ({ visible: true }),
          },
          {
            header: 'some-header--with-error',
            value: () => 'will be ignored',
            visibility: () => ({ error: 'error!' }),
          },
        ]}
      />,
      {
        initializeJotai,
      },
    );

    cy.contains('some-header--hidden:', { timeout: 10000 }).should('not.exist');
    cy.contains('should not be visible', { timeout: 10000 }).should(
      'not.exist',
    );

    cy.contains('some-header--visible:', { timeout: 10000 }).should('exist');
    cy.contains('should be visible', { timeout: 10000 }).should('exist');

    cy.contains('some-header--with-error:', { timeout: 10000 }).should('exist');
    cy.contains('will be ignored', { timeout: 10000 }).should('not.exist');
    cy.contains('common.messages.error', { timeout: 10000 }).should('exist');
  });
});
