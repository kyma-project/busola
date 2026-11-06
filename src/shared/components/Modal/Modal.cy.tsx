/* global cy, describe, it */
import { Button } from '@ui5/webcomponents-react';
import { Modal } from './Modal';

const opener = <Button data-testid="open-btn">Open</Button>;

describe('Modal', () => {
  describe('open/close', () => {
    it('opens when the opener component is clicked', () => {
      cy.mount(
        <Modal
          title="Test Modal"
          className="test-modal"
          modalOpeningComponent={opener}
          actions={null}
        >
          <span>Content</span>
          <span />
        </Modal>,
      );

      cy.get('ui5-dialog').should('not.have.attr', 'open');
      cy.get('[data-testid="open-btn"]').click();
      cy.get('ui5-dialog').should('have.attr', 'open');
    });

    it('closes when the cancel button is clicked', () => {
      cy.mount(
        <Modal
          title="Test Modal"
          className="test-modal"
          modalOpeningComponent={opener}
          cancelText="Cancel"
          actions={null}
        >
          <span>Content</span>
          <span />
        </Modal>,
      );

      cy.get('[data-testid="open-btn"]').click();
      cy.get('ui5-dialog').should('have.attr', 'open');
      cy.contains('Cancel').click();
      cy.get('ui5-dialog').should('not.have.attr', 'open');
    });
  });

  describe('title rendering', () => {
    it('renders the title as the dialog header text', () => {
      cy.mount(
        <Modal
          title="My Custom Title"
          className="test-modal"
          modalOpeningComponent={opener}
          actions={null}
        >
          <span>Content</span>
          <span />
        </Modal>,
      );

      cy.get('[data-testid="open-btn"]').click();
      cy.get('ui5-dialog').should(
        'have.attr',
        'header-text',
        'My Custom Title',
      );
    });
  });

  describe('action buttons', () => {
    it('renders the confirm button and calls onConfirm when clicked', () => {
      const onConfirm = cy.stub().as('onConfirm').returns(true);

      cy.mount(
        <Modal
          title="Test Modal"
          className="test-modal"
          modalOpeningComponent={opener}
          confirmText="Save"
          onConfirm={onConfirm}
          actions={null}
        >
          <span>Content</span>
          <span />
        </Modal>,
      );

      cy.get('[data-testid="open-btn"]').click();
      cy.get('[data-e2e-id="modal-confirmation-button"]').should('be.visible');
      cy.get('[data-e2e-id="modal-confirmation-button"]').click();
      cy.get('@onConfirm').should('have.been.calledOnce');
    });

    it('does not render the cancel button when cancelText is not provided', () => {
      cy.mount(
        <Modal
          title="Test Modal"
          className="test-modal"
          modalOpeningComponent={opener}
          confirmText="OK"
          actions={null}
        >
          <span>Content</span>
          <span />
        </Modal>,
      );

      cy.get('[data-testid="open-btn"]').click();
      cy.get('[data-e2e-id="modal-confirmation-button"]').should('exist');
      cy.get('ui5-dialog')
        .find('ui5-button[design="Transparent"]')
        .should('not.exist');
    });

    it('renders custom action buttons provided via the actions prop', () => {
      cy.mount(
        <Modal
          title="Test Modal"
          className="test-modal"
          modalOpeningComponent={opener}
          actions={(close: () => void) => [
            <Button key="ok" data-testid="custom-ok" onClick={close}>
              OK
            </Button>,
          ]}
        >
          <span>Content</span>
          <span />
        </Modal>,
      );

      cy.get('[data-testid="open-btn"]').click();
      cy.get('[data-testid="custom-ok"]').should('be.visible');
      cy.get('[data-testid="custom-ok"]').click();
      cy.get('ui5-dialog').should('not.have.attr', 'open');
    });
  });
});
