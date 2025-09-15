/* global cy */
import ListActions from '../ListActions';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

describe('ListActions', () => {
  it('Renders only standalone buttons', () => {
    const entry = { id: '123' };
    const actions = [
      { name: 'action1', handler: cy.stub().as('action1Handler') },
      { name: 'action2', handler: cy.stub().as('action2Handler') },
    ];

    cy.mount(<ListActions actions={actions} entry={entry} />);

    cy.get('[accessible-name="more-actions"]').should('not.exist');

    actions.forEach((action) => {
      cy.get(`[accessible-name="${action.name}"]`)
        .should('be.visible')
        .and('have.attr', 'accessible-name', action.name);

      cy.get(`[accessible-name="${action.name}"]`).click();
      cy.get(`@${action.name}Handler`).should('have.been.calledWith', entry);
    });
  });

  it('Renders more actions dropdown', () => {
    const actions = [
      { name: 'action1', handler: cy.stub().as('action1Handler') },
      { name: 'action2', handler: cy.stub().as('action2Handler') },
      { name: 'action3', handler: cy.stub().as('action3Handler') },
      { name: 'action4', handler: cy.stub().as('action4Handler') },
    ];

    cy.mount(<ListActions actions={actions} entry={{}} />);

    cy.get('[accessible-name="more-actions"]').should('be.visible');

    cy.get(`[accessible-name="${actions[0].name}"]`).should('be.visible');
    cy.get(`[accessible-name="${actions[3].name}"]`).should('not.be.visible');

    cy.get('[accessible-name="more-actions"]').click();

    cy.get(`[accessible-name="${actions[1].name}"]`).should('be.visible');
    cy.get(`[accessible-name="${actions[2].name}"]`).should('be.visible');
  });

  it('Renders icon for standalone button', () => {
    const actions = [
      { name: 'action', handler: cy.stub().as('actionHandler'), icon: 'edit' },
    ];

    cy.mount(<ListActions actions={actions} entry={{}} />);

    cy.get(`[accessible-name="${actions[0].name}"]`)
      .should('be.visible')
      .and('have.attr', 'icon', 'edit');

    // Ensure the action name text is not rendered
    cy.contains(actions[0].name).should('not.exist');
  });

  it('Renders predefined icons', () => {
    const actions = [
      { name: 'Edit', handler: cy.stub().as('editHandler') },
      { name: 'Delete', handler: cy.stub().as('deleteHandler') },
    ];

    cy.mount(<ListActions actions={actions} entry={{}} />);

    cy.get('[accessible-name="Edit"]').should('have.attr', 'icon', 'edit');
    cy.get('[accessible-name="Delete"]').should('have.attr', 'icon', 'delete');
  });

  it('Can override predefined icons', () => {
    const actions = [
      { name: 'Edit', handler: cy.stub().as('editHandler'), icon: 'add' },
      {
        name: 'Delete',
        handler: cy.stub().as('deleteHandler'),
        icon: 'delete',
      },
    ];

    cy.mount(<ListActions actions={actions} entry={{}} />);

    cy.get('[accessible-name="Edit"]').should('have.attr', 'icon', 'add');
    cy.get('[accessible-name="Delete"]').should('have.attr', 'icon', 'delete');
  });
});
