/* global cy */
import { Table } from '../Table';
import { DataSourcesContextProvider } from 'components/Extensibility/contexts/DataSources';

describe('Table Component', () => {
  const elements = [
    {
      key: 'first',
    },
    {
      key: 'second',
    },
  ];

  describe('entries', () => {
    it('From name, translated', () => {
      cy.mount(
        <Table
          value={elements}
          structure={{
            name: 'my-title',
          }}
        />,
      );

      cy.contains('my-title').should('be.visible');
    });

    it('No name, fall back to source, translated', () => {
      cy.mount(
        <Table value={[]} structure={{ source: 'resource.array-data' }} />,
      );

      cy.contains('resource.array-data').should('not.exist');
    });

    describe('entries handling', () => {
      it('passes array as entries', () => {
        const value = ['a'];

        cy.mount(<Table value={value} structure={{}} />);

        cy.get('ui5-table').should('have.length', 1);
      });

      it('for nullish value defaults to empty array', () => {
        cy.mount(<Table value={null} structure={{}} />);

        cy.get('ui5-table').should('have.length', 1);
      });

      it('for invalid value, renders "not-found" message', () => {
        cy.mount(<Table value={-3} structure={{}} />);

        cy.get('ui5-table').should('have.length', 1);
      });
    });

    describe('searching', () => {
      it('Renders Table without a search input', () => {
        const structure = {
          children: [],
        };

        cy.mount(<Table value={null} structure={structure} />);

        cy.get('input[aria-label^=search-]').should('not.exist');
      });

      it('Renders Table with a search input', () => {
        const structure = {
          children: [{ source: 'key', search: true }],
        };

        cy.mount(<Table value={elements} structure={structure} />);

        cy.get('ui5-input[id^=search-]').should('be.visible').and('exist');
        cy.contains('first').should('exist');
      });
    });

    describe('header & row renderer', () => {
      it('passes empty renderers for nullish children', () => {
        cy.mount(<Table value={[]} structure={{ children: null }} />);

        cy.get('ui5-table').should('have.length', 1);
        cy.get('ui5-table').within(() => {
          cy.get('ui5-table-header-row').should('have.length', 0);
        });
      });

      it('renders rows with valid children', () => {
        cy.mount(
          <DataSourcesContextProvider value={{}} dataSources={{}}>
            <Table
              value={[{ a: 'b' }, { a: 'c' }]}
              structure={{ children: [{ path: '$.a' }] }}
            />
          </DataSourcesContextProvider>,
        );

        cy.get('ui5-table').should('have.length', 1);
        cy.get('ui5-table').within(() => {
          cy.get('ui5-table-row').should('have.length', 2);
        });
      });
    });
  });
});
