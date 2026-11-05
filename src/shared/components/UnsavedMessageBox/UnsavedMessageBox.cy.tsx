/* global cy, describe, it */
import { useAtomValue } from 'jotai';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { UnsavedMessageBox } from './UnsavedMessageBox';

function FormStateDisplay() {
  const state = useAtomValue(isFormOpenAtom);
  return (
    <div
      data-testid="form-state"
      data-form-open={String(state.formOpen)}
      data-leaving-form={String(state.leavingForm)}
    />
  );
}

function ResourceEditedDisplay() {
  const state = useAtomValue(isResourceEditedAtom);
  return (
    <div
      data-testid="resource-edited-state"
      data-is-edited={String(state.isEdited)}
    />
  );
}

const dirtyFormAtoms = [
  [isFormOpenAtom, { formOpen: true, leavingForm: true }],
  [isResourceEditedAtom, { isEdited: true }],
] as Array<[any, any]>;

describe('UnsavedMessageBox', () => {
  describe('shown when form is dirty', () => {
    it('is open when isFormOpenAtom has formOpen and leavingForm set', () => {
      cy.mount(<UnsavedMessageBox />, {
        initializeJotai: dirtyFormAtoms,
      });

      cy.get('ui5-dialog').should('have.attr', 'open');
    });

    it('is not open when leavingForm is false', () => {
      cy.mount(<UnsavedMessageBox />, {
        initializeJotai: [
          [isFormOpenAtom, { formOpen: true, leavingForm: false }],
        ],
      });

      cy.get('ui5-dialog').should('not.have.attr', 'open');
    });

    it('is open when isOpen prop is explicitly true', () => {
      cy.mount(<UnsavedMessageBox isOpen />);

      cy.get('ui5-dialog').should('have.attr', 'open');
    });
  });

  describe('confirm discards changes', () => {
    it('clears the edited state after Discard is clicked', () => {
      cy.mount(
        <>
          <UnsavedMessageBox />
          <ResourceEditedDisplay />
        </>,
        { initializeJotai: dirtyFormAtoms },
      );

      cy.get('ui5-dialog').should('have.attr', 'open');
      cy.contains('common.buttons.discard').click({ force: true });
      cy.get('[data-testid="resource-edited-state"]').should(
        'have.attr',
        'data-is-edited',
        'false',
      );
      cy.get('ui5-dialog').should('not.have.attr', 'open');
    });
  });

  describe('cancel returns to form', () => {
    it('keeps formOpen true, sets leavingForm false and closes the message box after Cancel is clicked', () => {
      cy.mount(
        <>
          <UnsavedMessageBox />
          <FormStateDisplay />
        </>,
        { initializeJotai: dirtyFormAtoms },
      );

      cy.get('ui5-dialog').should('have.attr', 'open');
      cy.contains('common.buttons.cancel').click({ force: true });
      cy.get('[data-testid="form-state"]')
        .should('have.attr', 'data-form-open', 'true')
        .and('have.attr', 'data-leaving-form', 'false');
      cy.get('ui5-dialog').should('not.have.attr', 'open');
    });
  });
});
