/* global cy */
import { t } from 'i18next';
import CodePanel from './CodePanel';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

describe('CodePanel Component', () => {
  it('renders text-only code response when no language is provided', () => {
    const code = 'const hello = "world";';

    cy.mount(<CodePanel code={code} language="" />);

    cy.get('.code-response').should('exist');
    cy.get('#copy-icon').should('exist');
    cy.get('#code-text').should('contain.text', code);
    cy.get('ui5-panel').should('not.exist');
    cy.get('pre').should('not.exist');
  });

  it('renders a code panel with syntax highlighting when language is provided', () => {
    const code = 'const hello = "world";';
    const language = 'javascript';

    cy.mount(<CodePanel code={code} language={language} />);

    cy.get('.code-panel').should('exist');
    cy.get('ui5-panel').should('exist');
    cy.get('ui5-title').should('contain.text', language);
    cy.get('pre').should('exist');
    cy.get('code').should('contain.text', code);
  });

  it('displays only the copy button when withAction is false or link is not provided', () => {
    const code = 'const hello = "world";';
    const language = 'javascript';

    cy.mount(<CodePanel code={code} language={language} withAction={false} />);

    cy.get('.action-button').should('have.length', 1);
    cy.get('.action-button')
      .eq(0)
      .should('have.attr', 'icon', 'copy');
    cy.get('.action-button')
      .eq(0)
      .should('contain.text', t('common.buttons.copy'));
  });

  it('displays both copy and place buttons when withAction is true and link is provided', () => {
    const code = 'const hello = "world";';
    const language = 'javascript';
    const link = {
      name: 'my-service',
      address: 'namespaces/default/services/my-service',
      actionType: 'New',
    };

    cy.mount(
      <CodePanel
        code={code}
        language={language}
        withAction={true}
        link={link}
      />,
    );

    cy.get('.action-button').should('have.length', 2);
    cy.get('.action-button')
      .eq(0)
      .should('have.attr', 'icon', 'copy')
      .should('have.attr', 'design', 'Transparent')
      .should('have.attr', 'accessible-name', t('common.buttons.copy'));
    cy.get('.action-button')
      .eq(1)
      .should('have.attr', 'icon', 'sys-add');
    cy.get('.action-button')
      .eq(1)
      .should('contain.text', t('common.buttons.place'));
  });

  it('renders the place button with correct attributes for namespace resources', () => {
    const code = 'apiVersion: v1\nkind: Service\nmetadata:\n  name: my-service';
    const language = 'yaml';
    const link = {
      name: 'my-service',
      address: 'namespaces/default/services/my-service',
      actionType: 'New',
    };

    cy.mount(
      <CodePanel
        code={code}
        language={language}
        withAction={true}
        link={link}
      />,
    );

    cy.get('.action-button')
      .eq(1)
      .should('exist');
    cy.get('.action-button')
      .eq(1)
      .should('have.attr', 'icon', 'sys-add');
    cy.get('.action-button')
      .eq(1)
      .should('contain.text', t('common.buttons.place'));
  });

  it('renders the place button with correct attributes for cluster-level resources', () => {
    const code =
      'apiVersion: rbac.authorization.k8s.io/v1\nkind: ClusterRole\nmetadata:\n  name: my-role';
    const language = 'yaml';
    const link = {
      name: 'my-role',
      address: 'clusterroles/my-role',
      actionType: 'Update',
    };

    cy.mount(
      <CodePanel
        code={code}
        language={language}
        withAction={true}
        link={link}
      />,
    );

    cy.get('.action-button')
      .eq(1)
      .should('exist');
    cy.get('.action-button')
      .eq(1)
      .should('have.attr', 'icon', 'sys-add');
    cy.get('.action-button')
      .eq(1)
      .should('contain.text', t('common.buttons.place'));
  });

  it('handles long code samples with proper wrapping', () => {
    const longCode =
      'const veryLongVariableName = "This is an extremely long string that should trigger the line wrapping feature of the syntax highlighter component and test if it works properly in all cases, even with very long continuous text without natural breaking points";';
    const language = 'javascript';

    cy.mount(<CodePanel code={longCode} language={language} />);

    cy.get('pre').should('exist');
    cy.get('code').should('be.visible');
    // Visual check for wrapping will be done in UI
  });

  it('renders correctly with different languages', () => {
    const languages = ['javascript', 'python', 'yaml', 'json', 'bash'];

    languages.forEach(lang => {
      const code = `// Sample ${lang} code`;
      cy.mount(<CodePanel code={code} language={lang} />);

      cy.get('ui5-title').should('contain.text', lang);
      cy.get('code').should('contain.text', code);
      cy.get('ui5-panel').should('exist');
    });
  });

  it('handles empty code string gracefully', () => {
    cy.mount(<CodePanel code="" language="javascript" />);

    cy.get('.code-panel').should('exist');
    cy.get('pre')
      .find('code')
      .should('exist');
  });

  it('renders correctly with Update action type', () => {
    const code = 'apiVersion: v1\nkind: Service\nmetadata:\n  name: my-service';
    const language = 'yaml';
    const link = {
      name: 'my-service',
      address: 'namespaces/default/services/my-service',
      actionType: 'Update',
    };

    cy.mount(
      <CodePanel
        code={code}
        language={language}
        withAction={true}
        link={link}
      />,
    );

    cy.get('.action-button')
      .eq(1)
      .should('exist');
  });

  it('renders panel header with correct title', () => {
    const code = 'const hello = "world";';
    const language = 'javascript';

    cy.mount(<CodePanel code={code} language={language} />);

    cy.get('ui5-title').should('contain.text', language);
    cy.get('ui5-title').should('have.attr', 'level', 'H6');
  });
});
