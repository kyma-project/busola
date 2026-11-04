/* global cy, describe, expect, it */
import { ResourceDetailsForm } from '../ResourceDetailsForm';
import { ResourceDetailsFormItem } from '../ResourceDetailsFormItem';

const BareText = () => 'rendered as bare text';

const mountRow = (value) =>
  cy.mount(
    <ResourceDetailsForm>
      <ResourceDetailsFormItem label="Field" value={value} />
    </ResourceDetailsForm>,
  );

describe('ResourceDetailsFormItem', () => {
  it('shows the label and a text value', () => {
    mountRow('plain value');

    cy.contains('ui5-label', 'Field').should('be.visible');
    cy.contains('plain value').should('be.visible');
  });

  it('shows a placeholder for an empty value', () => {
    mountRow('');

    cy.get('ui5-form-item').should('contain.text', '-');
  });

  it('shows false as text', () => {
    mountRow(false);

    cy.contains('false').should('be.visible');
  });

  it('shows a component that renders bare text', () => {
    mountRow(<BareText />);

    // The row itself is visible either way; check the text is laid out.
    cy.get('ui5-form-item').should(($item) => {
      const walker = document.createTreeWalker($item[0], NodeFilter.SHOW_TEXT);
      let textWidth = 0;
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.textContent.includes('rendered as bare text')) {
          const range = document.createRange();
          range.selectNodeContents(node);
          textWidth = range.getBoundingClientRect().width;
        }
      }
      expect(textWidth).to.be.above(0);
    });
  });
});
