/* global cy */
import { Widget } from '../Widget';
import { ExtensibilityTestWrapper } from './helpers';

describe('Widget Component', () => {
  const resource = {
    test: 'test-value',
  };

  describe('structure.visible', () => {
    it('not set -> render component as usual', () => {
      cy.mount(
        <ExtensibilityTestWrapper>
          <Widget value={resource} structure={{ source: '$.test' }} />
        </ExtensibilityTestWrapper>,
      );

      cy.contains('test-value').should('be.visible');
    });

    it('falsy (but not boolean "false") -> render component as usual', () => {
      cy.mount(
        <ExtensibilityTestWrapper>
          <Widget
            value={resource}
            structure={{ source: '$.test', visibility: null }}
          />
        </ExtensibilityTestWrapper>,
      );

      cy.contains('test-value').should('be.visible');
    });

    it('Explicitly false -> hide component', () => {
      cy.mount(
        <ExtensibilityTestWrapper>
          <Widget
            value={resource}
            structure={{ source: '$.test', visibility: false }}
          />
        </ExtensibilityTestWrapper>,
      );

      cy.contains('loading').should('not.exist');
      cy.contains('test-value').should('not.exist');
    });

    it('jsonata error -> display error', () => {
      cy.mount(
        <ExtensibilityTestWrapper>
          <Widget
            value={resource}
            structure={{ source: '$.test', visibility: '$undefinedMethod()' }}
          />
        </ExtensibilityTestWrapper>,
      );

      cy.contains('extensibility.configuration-error').should('be.visible');
    });

    it('jsonata -> control visibility', () => {
      cy.mount(
        <ExtensibilityTestWrapper>
          <Widget
            value={resource}
            structure={{
              source: '$.test',
              visibility: '$contains($value, "test")',
            }}
          />
          <Widget
            value={resource}
            structure={{
              source: '$.test',
              visibility: '$contains($value, "not-test")',
            }}
          />
        </ExtensibilityTestWrapper>,
      );

      cy.contains('loading').should('not.exist');
      cy.contains('test-value')
        .should('be.visible')
        .should('have.length', 1);
    });
  });
});
