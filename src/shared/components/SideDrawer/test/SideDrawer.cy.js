/* global cy */
import { SideDrawer } from '../SideDrawer';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

describe('SideDrawer', () => {
  const testText1 = 'hi there';
  const testContent1 = <p>{testText1}</p>;

  const testText2 = 'oh, hello';
  const testContent2 = <h3>{testText2}</h3>;

  it('Renders content', () => {
    cy.mount(<SideDrawer isOpenInitially={true}>{testContent1}</SideDrawer>);

    cy.contains(testText1).should('exist');
  });

  it('Renders bottom content', () => {
    cy.mount(
      <SideDrawer bottomContent={testContent2}>{testContent1}</SideDrawer>,
    );

    cy.contains(testText2).should('exist');
  });
});
