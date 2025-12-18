/* global cy, describe, it */
import { CopiableText } from '../CopiableText';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

describe('CopiableText', () => {
  it('renders the text', () => {
    const text = 'abcd und 123456';

    cy.mount(<CopiableText textToCopy={text} />);

    cy.contains(text).should('exist');
  });

  it('renders custom caption', () => {
    const text = 'abcd und 123456';
    const caption = <p>Copiable</p>;

    cy.mount(<CopiableText textToCopy={text}>{caption}</CopiableText>);

    cy.contains('Copiable').should('exist');
  });

  // testing the actual copiyng behavior is not possible due to cypress being limited on accessing the clipboard
});
