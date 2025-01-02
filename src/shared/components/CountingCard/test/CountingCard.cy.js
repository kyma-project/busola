/// <reference types="cypress" />
/* global cy */
import { CountingCard } from '../CountingCard';
import { Button } from '@ui5/webcomponents-react';

describe('CountingCard', () => {
  it('Renders valid CountingCard', () => {
    cy.mount(
      <CountingCard
        className="test123"
        value={123}
        title="Test CountingCard Title"
        subTitle="Test CountingCard Subtitle"
        resourceUrl="pods"
        isClusterResource={false}
        allNamespaceURL={true}
        extraInfo={[
          {
            title: 'ExtraInfo1',
            value: 111,
          },
          {
            title: 'ExtraInfo2',
            value: 222,
          },
        ]}
        additionalContent={<Button>Nice Button</Button>}
      />,
    );

    cy.get('ui5-card.counting-card.test123').should('exist');
    cy.contains('Test CountingCard Title').should('exist');
    cy.contains('Test CountingCard Subtitle').should('exist');
    cy.contains('123').should('exist');
    cy.contains('ExtraInfo1').should('exist');
    cy.contains('111').should('exist');
    cy.contains('ExtraInfo2').should('exist');
    cy.contains('222').should('exist');
    cy.get('ui5-card.counting-card.test123')
      .find('ui5-link.counting-card__link')
      .should('exist');
    cy.get('ui5-card.counting-card.test123')
      .find('ui5-button')
      .should('have.text', 'Nice Button');
  });

  it('Does not render link', () => {
    cy.mount(
      <CountingCard
        className="test123"
        value={123}
        title="Test CountingCard Title"
        subTitle="Test CountingCard Subtitle"
        extraInfo={[
          {
            title: 'ExtraInfo1',
            value: 111,
          },
          {
            title: 'ExtraInfo2',
            value: 222,
          },
        ]}
      />,
    );

    cy.get('ui5-card.counting-card.test123')
      .find('ui5-link.counting-card__link')
      .should('not.exist');
  });
});
