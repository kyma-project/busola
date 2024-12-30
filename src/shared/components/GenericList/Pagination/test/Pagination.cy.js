/* global cy */
import { Pagination } from '../Pagination';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

describe('Pagination', () => {
  it('Renders valid count of pages', () => {
    cy.mount(
      <Pagination
        itemsTotal={25}
        itemsPerPage={20}
        currentPage={1}
        onChangePage={cy.stub().as('onChangePage')}
        setLocalPageSize={cy.stub().as('setLocalPageSize')}
      />,
    );

    cy.get('ui5-input').should('have.attr', 'value', '1');
    cy.contains(/^2$/).should('exist');
    cy.contains(/^3$/).should('not.exist');
  });

  it('Renders valid count of pages - custom page size', () => {
    cy.mount(
      <Pagination
        itemsTotal={90}
        itemsPerPage={10}
        currentPage={5}
        onChangePage={cy.stub().as('onChangePage')}
        setLocalPageSize={cy.stub().as('setLocalPageSize')}
      />,
    );

    cy.contains(/^1$/).should('exist');
    cy.contains(/^2$/).should('not.exist');
    cy.contains(/^3$/).should('exist');
    cy.contains(/^4$/).should('exist');
    cy.get('ui5-input').should('have.attr', 'value', '5');
    cy.contains(/^6$/).should('exist');
    cy.contains(/^7$/).should('exist');
    cy.contains(/^8$/).should('not.exist');
    cy.contains(/^9$/).should('exist');

    cy.get('ui5-button:contains("...")').should('have.length', 2);
  });

  it('Fire events', () => {
    cy.mount(
      <Pagination
        itemsTotal={200}
        itemsPerPage={20}
        currentPage={5}
        onChangePage={cy.stub().as('onChangePage')}
        setLocalPageSize={cy.stub().as('setLocalPageSize')}
      />,
    );

    cy.contains(/^6$/).click();
    cy.get('@onChangePage').should('have.been.calledWith', 6);

    cy.get('[accessible-name="Next page"]').click();
    cy.get('@onChangePage').should('have.been.calledWith', 6);

    cy.get('[accessible-name="Previous page"]').click();
    cy.get('@onChangePage').should('have.been.calledWith', 4);
  });

  it('Disables correct links', () => {
    cy.mount(
      <Pagination
        itemsTotal={60}
        itemsPerPage={20}
        currentPage={1}
        onChangePage={cy.stub().as('onChangePage')}
        setLocalPageSize={cy.stub().as('setLocalPageSize')}
      />,
    );

    cy.get('[accessible-name="Previous page"]').should('be.disabled');
    cy.get('ui5-input').should('not.be.disabled');
    cy.contains(/^2$/).should('not.be.disabled');
    cy.contains(/^3$/).should('not.be.disabled');
    cy.get('[accessible-name="Next page"]').should('not.be.disabled');

    cy.mount(
      <Pagination
        itemsTotal={60}
        itemsPerPage={20}
        currentPage={3}
        onChangePage={cy.stub().as('onChangePage')}
        setLocalPageSize={cy.stub().as('setLocalPageSize')}
      />,
    );

    cy.get('[accessible-name="Previous page"]').should('not.be.disabled');
    cy.get('[accessible-name="Next page"]').should('be.disabled');

    cy.mount(
      <Pagination
        itemsTotal={60}
        itemsPerPage={20}
        currentPage={2}
        onChangePage={cy.stub().as('onChangePage')}
        setLocalPageSize={cy.stub().as('setLocalPageSize')}
      />,
    );

    cy.get('[accessible-name="Previous page"]').should('not.be.disabled');
    cy.get('[accessible-name="Next page"]').should('not.be.disabled');
  });
});
