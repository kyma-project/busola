/* global cy, describe, it */
import { ContentWrapper } from 'components/App/ContentWrapper/ContentWrapper';
import { Header } from 'header/Header';

describe('Non-floating layout integration', () => {
  describe('ContentWrapper', () => {
    it('renders #content-wrap without border-radius', () => {
      cy.mount(
        <ContentWrapper>
          <div>content</div>
        </ContentWrapper>,
      );

      cy.get('#content-wrap').should('have.css', 'border-radius', '0px');
    });

    it('renders #content-wrap without top margin class', () => {
      cy.mount(
        <ContentWrapper>
          <div>content</div>
        </ContentWrapper>,
      );

      cy.get('#content-wrap').should('not.have.class', 'sap-margin-top-tiny');
    });
  });

  describe('Header ShellBar', () => {
    it('renders the ShellBar without border-radius', () => {
      cy.mount(<Header />);

      cy.get('ui5-shellbar.header').should('have.css', 'border-radius', '0px');
    });

    it('renders the ShellBar without box-shadow', () => {
      cy.mount(<Header />);

      cy.get('ui5-shellbar.header').should('have.css', 'box-shadow', 'none');
    });
  });

  describe('#html-wrap layout', () => {
    it('renders #html-wrap without padding when both Header and ContentWrapper are present', () => {
      cy.mount(
        <div id="html-wrap">
          <Header />
          <div id="page-wrap">
            <ContentWrapper>
              <div>content</div>
            </ContentWrapper>
          </div>
        </div>,
      );

      cy.get('#html-wrap').should('have.css', 'padding', '0px');
    });
  });
});
