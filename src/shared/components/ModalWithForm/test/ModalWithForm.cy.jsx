/* global cy, describe, it */
import { ModalWithForm } from '../ModalWithForm';

describe('ModalWithForm', () => {
  it('Renders child component', () => {
    const child = <span>test</span>;

    cy.mount(
      <div>
        <ModalWithForm
          title=""
          performRefetch={() => {}}
          sendNotification={() => {}}
          confirmText="Create"
          button={{ text: 'Open' }}
          renderForm={() => child}
        />
      </div>,
    );

    cy.contains('Open').click();
    cy.contains('test').should('be.visible');
  });
});
