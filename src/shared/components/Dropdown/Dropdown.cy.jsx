/* global cy, Cypress */
import { Dropdown } from './Dropdown';

describe('Dropdown Component', () => {
  const defaultProps = {
    id: 'test-dropdown',
    label: 'Test Dropdown',
    options: [
      { key: '1', text: 'Option 1' },
      { key: '2', text: 'Option 2' },
      { key: '3', text: 'Option 3' },
    ],
    selectedKey: '1',
  };

  it('renders with required props', () => {
    cy.mount(<Dropdown {...defaultProps} />);

    cy.get('[data-testid="test-dropdown"]').should('exist');
    cy.contains('Test Dropdown').should('exist');
  });

  it('displays the correct selected value', () => {
    cy.mount(<Dropdown {...defaultProps} />);

    cy.get('[data-testid="test-dropdown"]')
      .shadow()
      .find('input')
      .should('have.value', 'Option 1');
  });

  it('handles option selection', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(<Dropdown {...defaultProps} onSelect={onSelect} />);

    cy.get('[data-testid="test-dropdown"]').click();
    cy.get('ui5-cb-item')
      .eq(1)
      .click();

    cy.get('@onSelect').should('have.been.calledOnce');
    cy.get('@onSelect').should(
      'have.been.calledWith',
      Cypress.sinon.match.any,
      {
        key: '2',
        text: 'Option 2',
      },
    );
  });

  it('displays empty list message when no options provided', () => {
    const emptyProps = {
      ...defaultProps,
      options: [],
      emptyListMessage: 'Custom Empty Message',
    };

    cy.mount(<Dropdown {...emptyProps} />);

    cy.get('[data-testid="test-dropdown"]')
      .shadow()
      .find('input')
      .should('have.value', 'Custom Empty Message')
      .should('be.disabled');
  });

  it('handles disabled state', () => {
    cy.mount(<Dropdown {...defaultProps} disabled={true} />);

    cy.get('[data-testid="test-dropdown"]')
      .shadow()
      .find('input')
      .should('be.disabled');
  });

  it('sets autocomplete to off on focus', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(<Dropdown {...defaultProps} onSelect={onSelect} />);

    cy.get('[data-testid="test-dropdown"]')
      .shadow()
      .find('input')
      .focus()
      .should('have.attr', 'autocomplete', 'off');
  });

  it('opens popover on focus', () => {
    cy.mount(<Dropdown {...defaultProps} />);

    cy.get('[data-testid="test-dropdown"]')
      .shadow()
      .find('input')
      .focus();

    cy.get('ui5-responsive-popover').should('have.attr', 'open');
  });

  it('opens popover on input click', () => {
    cy.mount(<Dropdown {...defaultProps} />);

    cy.get('[data-testid="test-dropdown"]')
      .shadow()
      .find('input')
      .click();

    cy.get('ui5-responsive-popover').should('have.attr', 'open');
  });

  it('opens popover on icon click', () => {
    cy.mount(<Dropdown {...defaultProps} />);

    cy.get('[data-testid="test-dropdown"]')
      .shadow()
      .find('ui5-icon[accessible-name="Select Options"]')
      .click();

    cy.get('ui5-responsive-popover').should('have.attr', 'open');
  });

  it('handles custom className prop', () => {
    cy.mount(<Dropdown {...defaultProps} className="custom-class" />);

    cy.get('[data-testid="test-dropdown"]').should(
      'have.class',
      'custom-class',
    );
  });

  it('uses label as placeholder when no placeholder provided', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(<Dropdown {...defaultProps} onSelect={onSelect} />);

    cy.get('[data-testid="test-dropdown"]').should(
      'have.attr',
      'placeholder',
      'Test Dropdown',
    );
  });

  it('uses custom placeholder when provided', () => {
    cy.mount(<Dropdown {...defaultProps} placeholder="Custom Placeholder" />);

    cy.get('[data-testid="test-dropdown"]').should(
      'have.attr',
      'placeholder',
      'Custom Placeholder',
    );
  });
});
