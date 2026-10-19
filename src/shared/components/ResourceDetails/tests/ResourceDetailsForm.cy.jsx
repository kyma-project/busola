/* global cy, describe, it */
import { FormGroup, FormItem, Label } from '@ui5/webcomponents-react';
import { ResourceDetailsForm } from '../ResourceDetailsForm';

const item = (name) => (
  <FormItem key={name} labelContent={<Label>{name}</Label>} />
);

describe('ResourceDetailsForm', () => {
  it('splits fragment and list items into two columns, first half left', () => {
    cy.mount(
      <ResourceDetailsForm>
        <>
          {item('a')}
          {['b', 'c', 'd', 'e'].map(item)}
        </>
      </ResourceDetailsForm>,
    );

    cy.get('ui5-form-group').should('have.length', 2);
    cy.get('ui5-form-group').first().children().should('have.length', 3);
    cy.get('ui5-form-group').last().children().should('have.length', 2);
  });

  it('drops empty entries before splitting', () => {
    cy.mount(
      <ResourceDetailsForm>
        <>
          {item('a')}
          {[false, item('b'), null, item('c')]}
        </>
      </ResourceDetailsForm>,
    );

    cy.get('ui5-form-item').should('have.length', 3);
    cy.get('ui5-form-group').first().children().should('have.length', 2);
    cy.get('ui5-form-group').last().children().should('have.length', 1);
  });

  it('keeps FormGroup children as they are', () => {
    cy.mount(
      <ResourceDetailsForm>
        <FormGroup>{item('a')}</FormGroup>
        <FormGroup>{item('b')}</FormGroup>
      </ResourceDetailsForm>,
    );

    cy.get('ui5-form-group').should('have.length', 2);
  });
});
