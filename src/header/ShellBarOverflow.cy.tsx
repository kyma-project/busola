/* global cy, describe, it */
import { ShellBar } from '@ui5/webcomponents-react';
import { ShellBarAction } from './ShellBarAction';

function TestShellBar({
  onAction,
  extraActions = 0,
  width,
}: {
  onAction: () => void;
  extraActions?: number;
  width?: string;
}) {
  return (
    <ShellBar primaryTitle="Busola" style={{ width }}>
      <ShellBarAction icon="sys-help" text="Target action" onClick={onAction} />
      {Array.from({ length: extraActions }, (_, index) => (
        <ShellBarAction
          key={index}
          icon="sys-help"
          text={`Extra action ${index + 1}`}
        />
      ))}
    </ShellBar>
  );
}

describe('ShellBar overflow actions', () => {
  it('calls a visible ShellBarItem handler once', () => {
    const onAction = cy.stub().as('onAction');

    cy.mount(<TestShellBar onAction={onAction} />);

    cy.get('ui5-shellbar-item[text="Target action"]')
      .shadow()
      .find('ui5-button')
      .click();

    cy.get('@onAction').should('have.been.calledOnce');
  });

  it('calls a ShellBarItem handler from the overflow menu', () => {
    cy.viewport(320, 600);
    const onAction = cy.stub().as('onAction');

    cy.mount(
      <TestShellBar onAction={onAction} extraActions={12} width="280px" />,
    );

    cy.get('ui5-shellbar')
      .shadow()
      .find('#ui5-shellbar-overflow-button')
      .should('be.visible')
      .click();
    cy.contains('ui5-li', 'Target action').click();

    cy.get('@onAction').should('have.been.calledOnce');
  });
});
