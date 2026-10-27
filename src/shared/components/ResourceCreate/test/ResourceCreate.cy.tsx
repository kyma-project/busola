/* global cy, describe, it */
import { useLocation } from 'react-router';
import { NotificationProvider } from 'shared/contexts/NotificationContext';
import { ResourceCreate } from '../ResourceCreate';

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="location-pathname">{location.pathname}</span>;
}

const baseProps = {
  title: 'Create ConfigMap',
  renderForm: ({
    formElementRef,
  }: {
    formElementRef: React.RefObject<HTMLFormElement | null>;
  }) => (
    <form ref={formElementRef} data-testid="test-form">
      <input name="name" />
    </form>
  ),
};

describe('ResourceCreate', () => {
  it('renders form content provided via renderForm', () => {
    cy.mount(
      <NotificationProvider>
        <ResourceCreate {...baseProps} />
      </NotificationProvider>,
    );

    cy.get('[data-testid="test-form"]').should('exist');
  });

  it('renders confirm and cancel buttons', () => {
    cy.mount(
      <NotificationProvider>
        <ResourceCreate {...baseProps} />
      </NotificationProvider>,
    );

    cy.contains('common.buttons.create').should('exist');
    cy.contains('common.buttons.cancel').should('exist');
  });

  it('clicking cancel navigates to layoutCloseCreateUrl', () => {
    cy.mount(
      <NotificationProvider>
        <ResourceCreate {...baseProps} layoutCloseCreateUrl="/home" />
        <LocationDisplay />
      </NotificationProvider>,
    );

    cy.contains('common.buttons.cancel').first().click({ force: true });
    cy.get('[data-testid="location-pathname"]')
      .invoke('text')
      .should('eq', '/home');
  });

  it('clicking the close-column button navigates to layoutCloseCreateUrl', () => {
    cy.mount(
      <NotificationProvider>
        <ResourceCreate {...baseProps} layoutCloseCreateUrl="/home" />
        <LocationDisplay />
      </NotificationProvider>,
    );

    cy.get('[accessible-name="close-column"]').click({ force: true });
    cy.get('[data-testid="location-pathname"]')
      .invoke('text')
      .should('include', '/home');
  });

  it('clicking submit dispatches a form submit event', () => {
    const submitStub = cy.stub().as('submitStub');

    cy.mount(
      <NotificationProvider>
        <ResourceCreate
          {...baseProps}
          renderForm={({
            formElementRef,
          }: {
            formElementRef: React.RefObject<HTMLFormElement | null>;
          }) => (
            <form
              ref={formElementRef}
              data-testid="test-form"
              onSubmit={submitStub}
            >
              <input name="name" />
            </form>
          )}
        />
      </NotificationProvider>,
    );

    cy.contains('common.buttons.create').first().click({ force: true });
    cy.get('@submitStub').should('have.been.calledOnce');
  });

  it('submit button is disabled when readOnly is true', () => {
    cy.mount(
      <NotificationProvider>
        <ResourceCreate {...baseProps} readOnly={true} />
      </NotificationProvider>,
    );

    // ui5-button stores disabled on the custom element host;
    // aria-disabled is handled internally by the UI5 web component
    cy.get('ui5-button[disabled]')
      .contains('common.buttons.create')
      .should('exist');
  });

  it('renders form in edit mode', () => {
    cy.mount(
      <NotificationProvider>
        <ResourceCreate
          {...baseProps}
          isEdit={true}
          renderForm={({
            formElementRef,
          }: {
            formElementRef: React.RefObject<HTMLFormElement | null>;
          }) => (
            <form ref={formElementRef}>
              <div data-testid="edit-content">Edit form</div>
            </form>
          )}
        />
      </NotificationProvider>,
    );

    cy.get('.edit-form').should('exist');
    cy.get('[data-testid="edit-content"]').should('exist');
  });

  it('shows error notification when submitting an invalid form', () => {
    cy.mount(
      <NotificationProvider>
        <ResourceCreate
          {...baseProps}
          renderForm={({
            formElementRef,
            setCustomValid,
          }: {
            formElementRef: React.RefObject<HTMLFormElement | null>;
            setCustomValid: (valid: boolean) => void;
          }) => (
            <form ref={formElementRef} data-testid="test-form">
              {/* empty .resource-form div so revalidate(false) calls setValid(false) */}
              <div className="resource-form" />
              <button
                type="button"
                data-testid="mark-invalid"
                onClick={() => setCustomValid(false)}
              >
                mark invalid
              </button>
            </form>
          )}
        />
      </NotificationProvider>,
    );

    cy.get('[data-testid="mark-invalid"]').click();
    cy.contains('common.buttons.create').first().click({ force: true });
    cy.get('ui5-dialog').should('exist');
  });
});
