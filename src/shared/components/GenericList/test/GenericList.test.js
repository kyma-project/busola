import React from 'react';
import { render, fireEvent, queryByText } from 'testing/reactTestingUtils';

import { GenericList } from 'shared/components/GenericList/GenericList';

describe('GenericList', () => {
  const defaultNotFoundText = 'components.generic-list.messages.not-found';

  const mockHeaderRenderer = entries => ['Id', 'Name', 'description'];
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

  it('Renders with minimal props', async () => {
    const { getByText } = render(
      <GenericList
        title=""
        entries={[]}
        headerRenderer={() => []}
        rowRenderer={() => []}
      />,
    );
    expect(await getByText(defaultNotFoundText)).toBeInTheDocument();
  });

  it('Renders custom notFoundMessage props', async () => {
    const notFoundMessage = 'abcd';
    const { getByText } = render(
      <GenericList
        title=""
        entries={[]}
        headerRenderer={() => []}
        rowRenderer={() => []}
        notFoundMessage={notFoundMessage}
      />,
    );
    expect(await getByText(notFoundMessage)).toBeInTheDocument();
  });

  it('Renders title', async () => {
    const title = 'title';
    const { getByText } = render(
      <GenericList
        title={title}
        entries={[]}
        headerRenderer={() => []}
        rowRenderer={() => []}
      />,
    );
    expect(await getByText(title)).toBeInTheDocument();
  });

  describe('Actions', () => {
    it("Renders actions button when 'actions' prop is provided", () => {
      const actions = [{ name: 'testaction', handler: () => {} }];
      const { getAllByLabelText } = render(
        <GenericList
          headerRenderer={() => []}
          rowRenderer={() => []}
          actions={actions}
          entries={mockEntries}
        />,
      );
      const actionButtons = getAllByLabelText(actions[0].name);
      expect(actionButtons.length).toBe(mockEntries.length);
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
      const { queryByLabelText } = render(
        <GenericList
          headerRenderer={() => []}
          rowRenderer={() => []}
          actions={actions}
          entries={[{ id: '23' }]}
        />,
      );
      expect(queryByLabelText(actions[0].name)).toBeNull();
      expect(queryByLabelText(actions[1].name)).toBeTruthy();
    });

    it('Renders extra column in header when only actions are set', () => {
      const actions = [{ name: 'testaction', handler: () => {} }];
      const { queryByLabelText, rerender } = render(
        <GenericList
          headerRenderer={() => []}
          rowRenderer={() => []}
          actions={actions}
          entries={mockEntries}
        />,
      );

      expect(queryByLabelText('actions-column')).toBeInTheDocument();

      rerender(
        <GenericList
          headerRenderer={() => []}
          rowRenderer={() => []}
          entries={mockEntries}
        />,
      );

      expect(queryByLabelText('actions-column')).not.toBeInTheDocument();
    });
  });

  it('Renders entries', async () => {
    const { getByText } = render(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockEntryRenderer}
      />,
    );

    mockEntries.forEach(entry =>
      Object.keys(entry)
        .filter(key => key != 'metadata')
        .forEach(key => getByText(entry[key])),
    );
  });

  it('Renders custom data using custom entryRenderer', async () => {
    const customEntryRenderer = entry => [entry.name, 'maskopatol'];

    const { queryByText } = render(
      <GenericList
        entries={[mockEntries[0]]}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={customEntryRenderer}
      />,
    );

    expect(await queryByText(mockEntries[0].name)).toBeInTheDocument();
  });

  it('Renders collapse entries with collapse control', async () => {
    const mockCollapseEntryRenderer = entry => ({
      cells: [entry.id, entry.name, entry.description],
      collapseContent: <td colSpan="4">{entry.name}</td>,
      showCollapseControl: entry.id !== '3',
    });

    const { getByText, getAllByTestId } = render(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockCollapseEntryRenderer}
      />,
    );

    mockEntries.forEach(entry =>
      Object.keys(entry)
        .filter(key => key !== 'metadata')
        .forEach(key => getByText(entry[key])),
    );

    let foundCollapseButtons = await getAllByTestId('collapse-button-close');
    expect(foundCollapseButtons).toHaveLength(2);

    fireEvent.click(foundCollapseButtons[0]);

    foundCollapseButtons = await getAllByTestId('collapse-button-close');
    expect(foundCollapseButtons).toHaveLength(1);
    foundCollapseButtons = await getAllByTestId('collapse-button-open');
    expect(foundCollapseButtons).toHaveLength(1);

    const foundCollapseContents = await getAllByTestId('collapse-content');
    expect(foundCollapseContents).toHaveLength(1);
  });

  it('Renders collapse entries without collapse control', async () => {
    const mockCollapseEntryRenderer = entry => ({
      cells: [entry.id, entry.name, entry.description],
      collapseContent: <td colSpan="4">{entry.name}</td>,
      withCollapseControl: false,
    });

    const { getAllByTestId, queryAllByTestId } = render(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockCollapseEntryRenderer}
      />,
    );

    let foundCollapseButtons = await queryAllByTestId('collapse-button-close');
    expect(foundCollapseButtons).toHaveLength(0);
    foundCollapseButtons = await queryAllByTestId('collapse-button-open');
    expect(foundCollapseButtons).toHaveLength(0);

    const foundCollapseContents = await getAllByTestId('collapse-content');
    expect(foundCollapseContents).toHaveLength(3);
  });

  it('Renders headers', async () => {
    const { getByText } = render(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockEntryRenderer}
      />,
    );

    mockHeaderRenderer().forEach(async header => await getByText(header));
  });

  it("Doesn't render header with showHeader set to false", async () => {
    const { queryAllByRole } = render(
      <GenericList
        entries={[]}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockEntryRenderer}
        showHeader={false}
      />,
    );
    const foundRows = queryAllByRole('row');
    expect(foundRows).toHaveLength(1);
    expect(queryByText(foundRows[0], defaultNotFoundText)).toBeInTheDocument();
  });

  it('Renders extreaHeaderContent', async () => {
    const content = 'wow this is so extra!';
    const { getByText } = render(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockEntryRenderer}
        extraHeaderContent={<span>{content}</span>}
      />,
    );

    expect(await getByText(content)).toBeInTheDocument();
  });

  it('Test sorting funcionality', () => {
    const { getByLabelText, queryByText, getByText, getAllByRole } = render(
      <GenericList
        title=""
        entries={mockEntries}
        headerRenderer={() => ['name', 'description']}
        rowRenderer={entry => [entry.name, entry.description]}
        sortBy={{
          name: (a, b) => a.name.localeCompare(b.name),
          description: (a, b) => a.description.localeCompare(b.description),
        }}
      />,
    );
    // opening sort modal
    fireEvent.click(getByLabelText('open-sort'));

    // checking is sort modal open
    expect(queryByText('common.sorting.sort')).toBeInTheDocument();

    // checking generating of sort by form
    expect(queryByText('common.sorting.description')).toBeInTheDocument();

    // choosing option to sort
    fireEvent.click(getByText('common.sorting.desc'));
    fireEvent.click(getByText('common.sorting.description'));
    fireEvent.click(getByText('common.buttons.ok'));

    // checking sorted items
    expect(getAllByRole('row')[0].textContent).toBe(
      ' THIRD_ENTRY testdescription3',
    );
    expect(getAllByRole('row')[1].textContent).toBe(
      ' second_entry testdescription2',
    );
    expect(getAllByRole('row')[2].textContent).toBe(
      ' first_entry testdescription1',
    );
  });

  describe('Search', () => {
    it('Show search field by default', async () => {
      const { getByRole } = render(
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
        />,
      );

      expect(await getByRole('search')).toBeInTheDocument();
    });

    it("Doesn't show search field when showSearchField is set to false", async () => {
      const { queryByRole } = render(
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
          searchSettings={{
            showSearchField: false,
          }}
        />,
      );

      expect(await queryByRole('search')).toBeNull();
    });

    it('Finds proper entries when search text is entered', async () => {
      const searchText = 'first';

      const { queryAllByRole, getByLabelText } = render(
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
        />,
      );
      expect(await queryAllByRole(/^(row|datarow)$/)).toHaveLength(
        mockEntries.length,
      );

      const searchInput = await getByLabelText('search-input');
      fireEvent.change(searchInput, { target: { value: searchText } });

      expect(await queryAllByRole(/^(row|datarow)$/)).toHaveLength(1);
    });

    it('Finds proper entries by label when search text is entered', async () => {
      const searchText = 'label1=val';

      const { queryAllByRole, getByLabelText } = render(
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
          searchSettings={{
            textSearchProperties: ['metadata.labels'],
          }}
        />,
      );
      expect(await queryAllByRole(/^(row|datarow)$/)).toHaveLength(
        mockEntries.length,
      );

      const searchInput = await getByLabelText('search-input');
      fireEvent.change(searchInput, { target: { value: searchText } });

      expect(await queryAllByRole(/^(row|datarow)$/)).toHaveLength(2);
    });

    it('Search is case insensitive', async () => {
      let searchText = 'third';

      const { queryAllByRole, getByLabelText } = render(
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
        />,
      );

      expect(await queryAllByRole(/^(row|datarow)$/)).toHaveLength(
        mockEntries.length,
      );

      let searchInput = await getByLabelText('search-input');
      fireEvent.change(searchInput, { target: { value: searchText } });

      expect(await queryAllByRole(/^(row|datarow)$/)).toHaveLength(1);

      searchText = 'THIRD';
      searchInput = await getByLabelText('search-input');
      fireEvent.change(searchInput, { target: { value: searchText } });

      expect(await queryAllByRole(/^(row|datarow)$/)).toHaveLength(1);
    });

    it('Shows no search result message when there are no results', async () => {
      const searchText = "Do you really can't find it?";
      const noSearchResultMessage = 'Yes, sorry';

      const { queryAllByRole, getByLabelText, getByText } = render(
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
          searchSettings={{
            noSearchResultMessage,
          }}
        />,
      );

      expect(await queryAllByRole(/^(row|datarow)$/)).toHaveLength(
        mockEntries.length,
      );

      const searchInput = await getByLabelText('search-input');
      fireEvent.change(searchInput, { target: { value: searchText } });

      expect(await queryAllByRole(/^(row|datarow)$/)).toHaveLength(1);
      expect(await getByText(noSearchResultMessage)).toBeInTheDocument();
    });

    it('Shows server error message if dataError prop is true', async () => {
      const serverErrorMessage = {
        message: 'Something failed',
        originalMessage: '',
      };

      const { queryAllByRole, getByText } = render(
        <GenericList
          entries={[]}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
          serverDataError={serverErrorMessage}
        />,
      );

      expect(await queryAllByRole('row')).toHaveLength(1);
      expect(
        await getByText(new RegExp(serverErrorMessage.message, 'i')),
      ).toBeInTheDocument();
    });

    it('Shows Spinner if dataLoading prop is true', async () => {
      const { getByLabelText } = render(
        <GenericList
          entries={[]}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
          serverDataLoading={true}
        />,
      );

      expect(await getByLabelText('Loading')).toBeInTheDocument();
    });
  });
});
