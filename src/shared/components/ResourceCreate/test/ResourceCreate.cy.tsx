/* global cy, describe, it */
import { useLocation } from 'react-router';
import { useAtomValue } from 'jotai';
import { NotificationProvider } from 'shared/contexts/NotificationContext';
import { ResourceCreate } from '../ResourceCreate';
import { columnLayoutAtom } from 'state/columnLayoutAtom';

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="location-pathname">{location.pathname}</span>;
}

function ColumnLayoutDisplay() {
  const layout = useAtomValue(columnLayoutAtom);
  return (
    <div
      data-testid="column-layout-state"
      data-layout={layout.layout}
      data-show-create={layout.showCreate !== null ? 'active' : 'null'}
    />
  );
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

const renderResourceCreateWithBaseProps = (
  props = {},
  children?: React.ReactNode,
) => (
  <NotificationProvider>
    <ResourceCreate {...baseProps} {...props} />
    {children}
  </NotificationProvider>
);

describe('ResourceCreate', () => {
  it('renders form content provided via renderForm', () => {
    cy.mount(renderResourceCreateWithBaseProps());

    cy.get('[data-testid="test-form"]').should('exist');
  });

  it('renders confirm and cancel buttons', () => {
    cy.mount(renderResourceCreateWithBaseProps());

    cy.contains('common.buttons.create').should('exist');
    cy.contains('common.buttons.cancel').should('exist');
  });

  it('clicking cancel navigates to layoutCloseCreateUrl and resets columnLayoutAtom', () => {
    cy.mount(
      renderResourceCreateWithBaseProps(
        { layoutCloseCreateUrl: '/home' },
        <>
          <LocationDisplay />
          <ColumnLayoutDisplay />
        </>,
      ),
      {
        initializeJotai: [
          [
            columnLayoutAtom,
            {
              layout: 'TwoColumnsMidExpanded',
              startColumn: null,
              midColumn: null,
              endColumn: null,
              showCreate: { resourceType: 'ConfigMap', namespaceId: 'default' },
              showEdit: null,
            },
          ],
        ],
      },
    );

    cy.contains('common.buttons.cancel').first().click({ force: true });
    cy.get('[data-testid="location-pathname"]')
      .invoke('text')
      .should('eq', '/home');
    cy.get('[data-testid="column-layout-state"]')
      .should('have.attr', 'data-layout', 'OneColumn')
      .and('have.attr', 'data-show-create', 'null');
  });

  it('clicking the close-column button navigates to layoutCloseCreateUrl and resets columnLayoutAtom', () => {
    cy.mount(
      renderResourceCreateWithBaseProps(
        { layoutCloseCreateUrl: '/home' },
        <>
          <LocationDisplay />
          <ColumnLayoutDisplay />
        </>,
      ),
      {
        initializeJotai: [
          [
            columnLayoutAtom,
            {
              layout: 'TwoColumnsMidExpanded',
              startColumn: null,
              midColumn: null,
              endColumn: null,
              showCreate: { resourceType: 'ConfigMap', namespaceId: 'default' },
              showEdit: null,
            },
          ],
        ],
      },
    );

    cy.get('[accessible-name="close-column"]').first().click({ force: true });
    cy.get('[data-testid="location-pathname"]')
      .invoke('text')
      .should('include', '/home');
    cy.get('[data-testid="column-layout-state"]')
      .should('have.attr', 'data-layout', 'OneColumn')
      .and('have.attr', 'data-show-create', 'null');
  });

  it('clicking submit dispatches a form submit event', () => {
    const submitStub = cy.stub().as('submitStub');

    cy.mount(
      renderResourceCreateWithBaseProps({
        renderForm: ({
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
        ),
      }),
    );

    cy.contains('common.buttons.create').first().click({ force: true });
    cy.get('@submitStub').should('have.been.calledOnce');
  });

  it('submit button is disabled when readOnly is true', () => {
    cy.mount(renderResourceCreateWithBaseProps({ readOnly: true }));

    // ui5-button stores disabled on the custom element host;
    // aria-disabled is handled internally by the UI5 web component
    cy.get('ui5-button[disabled]')
      .contains('common.buttons.create')
      .should('exist');
  });

  it('renders form in edit mode', () => {
    cy.mount(
      renderResourceCreateWithBaseProps({
        isEdit: true,
        renderForm: ({
          formElementRef,
        }: {
          formElementRef: React.RefObject<HTMLFormElement | null>;
        }) => (
          <form ref={formElementRef}>
            <div data-testid="edit-content">Edit form</div>
          </form>
        ),
      }),
    );

    cy.get('.edit-form').should('exist');
    cy.get('[data-testid="edit-content"]').should('exist');
  });

  it('shows error notification when submitting an invalid form', () => {
    cy.mount(
      renderResourceCreateWithBaseProps({
        renderForm: ({
          formElementRef,
          isValid,
          setCustomValid,
        }: {
          formElementRef: React.RefObject<HTMLFormElement | null>;
          isValid: boolean;
          setCustomValid: (valid: boolean) => void;
        }) => (
          <form
            ref={formElementRef}
            data-testid="test-form"
            data-valid={String(isValid)}
          >
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
        ),
      }),
    );

    cy.get('[data-testid="test-form"]').then(($form) => {
      $form[0].addEventListener('submit', cy.stub().as('formSubmit'));
    });
    cy.get('[data-testid="mark-invalid"]').click();
    cy.get('[data-testid="test-form"][data-valid="false"]').should('exist');
    cy.contains('common.buttons.create').first().click({ force: true });

    cy.get('ui5-dialog').should('have.attr', 'open');
    cy.get('ui5-dialog')
      .contains('common.messages.must-fill-required')
      .should('be.visible');
    cy.get('@formSubmit').should('not.have.been.called');
  });
});
