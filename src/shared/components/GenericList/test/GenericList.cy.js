/* global cy */
import { GenericList } from '../GenericList';

const defaultNotFoundText = 'components.generic-list.messages.not-found';

const mockHeaderRenderer = () => ['Id', 'Name', 'description'];
const mockEntryRenderer = entry => [entry.id, entry.name, entry.description];

const mockEntries = [
  {
    id: '1',
    name: 'first_entry',
    description: 'testdescription1',
    metadata: { labels: { label1: 'val1' } },
  },
  {
    id: '2',
    name: 'second_entry',
    description: 'testdescription2',
    metadata: { labels: { label1: 'val2' } },
  },
  {
    id: '3',
    name: 'THIRD_ENTRY',
    description: 'testdescription3',
    metadata: { labels: { label1: 'otherval' } },
  },
];

describe('GenericList', () => {
  describe('Actions', () => {
    it("Renders actions button when 'actions' prop is provided", () => {
      const actions = [{ name: 'testaction', handler: () => {} }];

      cy.mount(
        <GenericList
          headerRenderer={() => []}
          rowRenderer={() => []}
          actions={actions}
          entries={mockEntries}
        />,
      );

      cy.get('[accessible-name="testaction"]').should(
        'have.length',
        mockEntries.length,
      );
    });

    it("Skips rendering actions when 'actions' prop passes skipAction() call", () => {
      const actions = [
        { name: 'skip it', handler: () => {}, skipAction: () => true },
        {
          name: 'no skipping here',
          handler: () => {},
          skipAction: () => false,
        },
      ];

      cy.mount(
        <GenericList
          headerRenderer={() => []}
          rowRenderer={() => []}
          actions={actions}
          entries={[{ id: '23' }]}
        />,
      );

      cy.get('[accessible-name="skip it"]').should('not.exist');
      cy.get('[accessible-name="no skipping here"]').should('exist');
    });

    it('Renders extra column in header when only actions are set', () => {
      const actions = [{ name: 'testaction', handler: () => {} }];
      cy.mount(
        <GenericList
          headerRenderer={() => []}
          rowRenderer={() => []}
          actions={actions}
          entries={mockEntries}
        />,
      );

      cy.get('[aria-label="actions-column"]').should('exist');

      cy.mount(
        <GenericList
          headerRenderer={() => []}
          rowRenderer={() => []}
          entries={mockEntries}
        />,
      );

      cy.get('[aria-label="actions-column"]').should('not.exist');
    });
  });

  it('Renders entries', () => {
    cy.mount(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockEntryRenderer}
      />,
    );

    mockEntries.forEach(entry => {
      Object.keys(entry)
        .filter(key => key !== 'metadata')
        .forEach(key => {
          cy.contains(entry[key]).should('exist');
        });
    });
  });

  it('Renders custom data using custom entryRenderer', () => {
    const customEntryRenderer = entry => [entry.name, 'maskopatol'];

    cy.mount(
      <GenericList
        entries={[mockEntries[0]]}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={customEntryRenderer}
      />,
    );

    cy.contains(mockEntries[0].name).should('exist');
    cy.contains('maskopatol').should('exist');
  });

  it('Renders collapse entries with collapse control', () => {
    const mockCollapseEntryRenderer = entry => ({
      cells: [entry.id, entry.name, entry.description],
      collapseContent: (
        <td colSpan="4" data-testid="collapse-content">
          {entry.name}
        </td>
      ),
      showCollapseControl: entry.id !== '3',
    });

    cy.mount(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockCollapseEntryRenderer}
      />,
    );

    mockEntries.forEach(entry => {
      Object.keys(entry)
        .filter(key => key !== 'metadata')
        .forEach(key => {
          cy.contains(entry[key]).should('exist');
        });
    });

    cy.get('[data-testid="collapse-button-close"]').should('have.length', 2);

    cy.get('[data-testid="collapse-button-close"]')
      .first()
      .click();

    cy.get('[data-testid="collapse-button-close"]').should('have.length', 1);
    cy.get('[data-testid="collapse-button-open"]').should('have.length', 1);
    cy.get('[data-testid="collapse-content"]').should('have.length', 1);
  });

  it('Renders collapse entries without collapse control', () => {
    const mockCollapseEntryRenderer = entry => ({
      cells: [entry.id, entry.name, entry.description],
      collapseContent: (
        <td colSpan="4" data-testid="collapse-content">
          {entry.name}
        </td>
      ),
      withCollapseControl: false,
    });

    cy.mount(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockCollapseEntryRenderer}
      />,
    );

    cy.get('[data-testid="collapse-button-close"]').should('have.length', 0);
    cy.get('[data-testid="collapse-button-open"]').should('have.length', 0);

    cy.get('[data-testid="collapse-content"]').should('have.length', 3);
  });

  it('Renders headers', () => {
    cy.mount(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockEntryRenderer}
      />,
    );

    mockHeaderRenderer().forEach(header => {
      cy.contains(header).should('exist');
    });
  });

  it("Doesn't render header with showHeader set to false", () => {
    cy.mount(
      <GenericList
        entries={[]}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockEntryRenderer}
        showHeader={false}
      />,
    );

    cy.get('tr').should('have.length', 1);
    cy.contains(defaultNotFoundText).should('exist');
  });

  it('Renders extraHeaderContent', () => {
    const content = 'wow this is so extra!';

    cy.mount(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockEntryRenderer}
        extraHeaderContent={<span>{content}</span>}
      />,
    );

    cy.contains(content).should('exist');
  });

  it('Renders with minimal props', () => {
    cy.mount(
      <GenericList
        title=""
        entries={[]}
        headerRenderer={() => []}
        rowRenderer={() => []}
      />,
    );

    cy.contains(defaultNotFoundText).should('exist');
  });

  it('Renders custom notFoundMessage props', () => {
    const notFoundMessage = 'abcd';

    cy.mount(
      <GenericList
        title=""
        entries={[]}
        headerRenderer={() => []}
        rowRenderer={() => []}
        notFoundMessage={notFoundMessage}
      />,
    );

    cy.contains(notFoundMessage).should('exist');
  });

  it('Renders title', () => {
    const title = 'title';

    cy.mount(
      <GenericList
        title={title}
        entries={[]}
        headerRenderer={() => []}
        rowRenderer={() => []}
      />,
    );

    cy.contains(title).should('exist');
  });

  describe('Search', () => {
    it('Shows search field by default', () => {
      cy.mount(
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
        />,
      );

      cy.get('[role="search"]').should('exist');
    });

    it("Doesn't show search field when showSearchField is set to false", () => {
      cy.mount(
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
          searchSettings={{
            showSearchField: false,
          }}
        />,
      );

      cy.get('[role="search"]').should('not.exist');
    });

    it('Shows server error message if dataError prop is true', () => {
      const serverErrorMessage = {
        message: 'Something failed',
        originalMessage: '',
      };

      cy.mount(
        <GenericList
          entries={[]}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
          serverDataError={serverErrorMessage}
        />,
      );

      cy.get('[role="row"]').should('have.length', 1);
      cy.contains(new RegExp(serverErrorMessage.message, 'i')).should('exist');
    });

    it('Shows Spinner if dataLoading prop is true', () => {
      cy.mount(
        <GenericList
          entries={[]}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
          serverDataLoading={true}
        />,
      );

      cy.get('[aria-label="Loading"]').should('exist');
    });
  });
});
