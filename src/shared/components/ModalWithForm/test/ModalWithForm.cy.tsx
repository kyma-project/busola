/* global cy, describe, it */
import { ReactNode, RefObject } from 'react';
import { NotificationProvider } from 'shared/contexts/NotificationContext';
import { ModalWithForm } from '../ModalWithForm';

const renderTestForm = ({
  formElementRef,
  onSubmit,
}: {
  formElementRef: RefObject<HTMLFormElement | null>;
  onSubmit?: () => void;
}) => (
  <form ref={formElementRef} data-testid="test-form" onSubmit={onSubmit}>
    <input name="name" defaultValue="test-value" />
  </form>
);

const mountModalWithForm = (
  renderForm: (args: any) => ReactNode = ({ formElementRef }: any) =>
    renderTestForm({ formElementRef }),
  extraProps = {},
) =>
  cy.mount(
    <NotificationProvider>
      <ModalWithForm
        title="Test Modal"
        confirmText="Create"
        renderForm={renderForm}
        modalOpeningComponent={<button data-testid="open-btn">Open</button>}
        {...extraProps}
      />
    </NotificationProvider>,
  );

describe('ModalWithForm', () => {
  describe('form rendering inside modal', () => {
    it('renders the form content after the opener is clicked', () => {
      mountModalWithForm();

      cy.get('[data-testid="test-form"]').should('not.exist');
      cy.get('[data-testid="open-btn"]').click();
      cy.get('[data-testid="test-form"]').should('exist');
    });

    it('renders the confirm and cancel buttons when open', () => {
      mountModalWithForm();

      cy.get('[data-testid="open-btn"]').click();
      cy.contains('Create').should('be.visible');
      cy.contains('common.buttons.cancel').should('be.visible');
    });
  });

  describe('submit triggers callback', () => {
    it('dispatches a submit event on the form when the confirm button is clicked', () => {
      const onSubmit = cy.stub().as('onSubmit');

      mountModalWithForm(({ formElementRef }: any) =>
        renderTestForm({ formElementRef, onSubmit }),
      );

      cy.get('[data-testid="open-btn"]').click();
      cy.contains('Create').click({ force: true });
      cy.get('@onSubmit').should('have.been.calledOnce');
    });
  });

  describe('cancel closes without saving', () => {
    it('closes the dialog when cancel is clicked', () => {
      mountModalWithForm();

      cy.get('[data-testid="open-btn"]').click();
      cy.get('ui5-dialog').should('have.attr', 'open');
      cy.contains('common.buttons.cancel').click({ force: true });
      cy.get('ui5-dialog').should('not.have.attr', 'open');
    });

    it('does not submit the form when cancel is clicked', () => {
      const onSubmit = cy.stub().as('onSubmit');

      mountModalWithForm(({ formElementRef }: any) =>
        renderTestForm({ formElementRef, onSubmit }),
      );

      cy.get('[data-testid="open-btn"]').click();
      cy.contains('common.buttons.cancel').click({ force: true });
      cy.get('@onSubmit').should('not.have.been.called');
    });
  });
});
