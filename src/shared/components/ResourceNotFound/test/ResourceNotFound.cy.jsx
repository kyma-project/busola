/* global cy, describe, it */
import { ResourceNotFound } from '../ResourceNotFound';

describe('ResourceNotFound', () => {
  it('Renders resource type', () => {
    cy.mount(<ResourceNotFound resource="Resource" />);

    cy.contains('components.resource-not-found.messages.not-found').should(
      'be.visible',
    );
  });

  it('Renders custom message', () => {
    const message = 'Error';

    cy.mount(<ResourceNotFound resource="Resource" customMessage={message} />);

    cy.contains(message).should('be.visible');
  });
});
