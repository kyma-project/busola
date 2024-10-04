import {
  render,
  fireEvent,
  queryByText,
  waitFor,
  act,
  queryAllByAttribute,
  queryByAttribute,
} from 'testing/reactTestingUtils';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ThemeProvider } from '@ui5/webcomponents-react';

describe('GenericList', () => {
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

  describe('Actions', () => {
    it("Renders actions button when 'actions' prop is provided", async () => {
      const actions = [{ name: 'testaction', handler: () => {} }];
      const { container } = render(
        <ThemeProvider>
          <GenericList
            headerRenderer={() => []}
            rowRenderer={() => []}
            actions={actions}
            entries={mockEntries}
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          const actionButtons = queryAllByAttribute(
            'accessible-name',
            container,
            actions[0].name,
          );
          expect(actionButtons.length).toBe(mockEntries.length);
        });
      });
    });

    it("Skips rendering actions when 'actions' prop passes skipAction() call", async () => {
      const actions = [
        { name: 'skip it', handler: () => {}, skipAction: () => true },
        {
          name: 'no skipping here',
          handler: () => {},
          skipAction: () => false,
        },
      ];
      const { container } = render(
        <ThemeProvider>
          <GenericList
            headerRenderer={() => []}
            rowRenderer={() => []}
            actions={actions}
            entries={[{ id: '23' }]}
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(
            queryByAttribute('accessible-name', container, actions[0].name),
          ).toBeNull();
          expect(
            queryByAttribute('accessible-name', container, actions[1].name),
          ).toBeTruthy();
        });
      });
    });

    it('Renders extra column in header when only actions are set', async () => {
      const actions = [{ name: 'testaction', handler: () => {} }];
      const { queryByLabelText, rerender } = render(
        <ThemeProvider>
          <GenericList
            headerRenderer={() => []}
            rowRenderer={() => []}
            actions={actions}
            entries={mockEntries}
          />
        </ThemeProvider>,
      );

      expect(queryByLabelText('actions-column')).toBeInTheDocument();
      await waitFor(async () => {
        await act(async () => {
          rerender(
            <ThemeProvider>
              <GenericList
                headerRenderer={() => []}
                rowRenderer={() => []}
                entries={mockEntries}
              />
            </ThemeProvider>,
          );
        });
      });

      expect(queryByLabelText('actions-column')).not.toBeInTheDocument();
    });
  });

  it('Renders entries', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
        />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        mockEntries.forEach(entry =>
          Object.keys(entry)
            .filter(key => key !== 'metadata')
            .forEach(key => getByText(entry[key])),
        );
      });
    });
  });

  it('Renders custom data using custom entryRenderer', async () => {
    const customEntryRenderer = entry => [entry.name, 'maskopatol'];

    const { queryByText } = render(
      <ThemeProvider>
        <GenericList
          entries={[mockEntries[0]]}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={customEntryRenderer}
        />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(queryByText(mockEntries[0].name)).toBeInTheDocument();
      });
    });
  });

  it('Renders collapse entries with collapse control', async () => {
    const mockCollapseEntryRenderer = entry => ({
      cells: [entry.id, entry.name, entry.description],
      collapseContent: <td colSpan="4">{entry.name}</td>,
      showCollapseControl: entry.id !== '3',
    });

    const { getByText, getAllByTestId } = render(
      <ThemeProvider>
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockCollapseEntryRenderer}
        />
      </ThemeProvider>,
    );

    await waitFor(async () => {
      mockEntries.forEach(entry =>
        Object.keys(entry)
          .filter(key => key !== 'metadata')
          .forEach(key => getByText(entry[key])),
      );
    });

    let foundCollapseButtons = getAllByTestId('collapse-button-close');
    expect(foundCollapseButtons).toHaveLength(2);
    await waitFor(async () => {
      await act(async () => {
        fireEvent.click(foundCollapseButtons[0]);

        foundCollapseButtons = getAllByTestId('collapse-button-close');
        expect(foundCollapseButtons).toHaveLength(1);
        foundCollapseButtons = getAllByTestId('collapse-button-open');
        expect(foundCollapseButtons).toHaveLength(1);

        const foundCollapseContents = getAllByTestId('collapse-content');
        expect(foundCollapseContents).toHaveLength(1);
      });
    });
  });

  it('Renders collapse entries without collapse control', async () => {
    const mockCollapseEntryRenderer = entry => ({
      cells: [entry.id, entry.name, entry.description],
      collapseContent: <td colSpan="4">{entry.name}</td>,
      withCollapseControl: false,
    });

    const { getAllByTestId, queryAllByTestId } = render(
      <ThemeProvider>
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockCollapseEntryRenderer}
        />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        let foundCollapseButtons = queryAllByTestId('collapse-button-close');
        expect(foundCollapseButtons).toHaveLength(0);
        foundCollapseButtons = queryAllByTestId('collapse-button-open');
        expect(foundCollapseButtons).toHaveLength(0);

        const foundCollapseContents = getAllByTestId('collapse-content');
        expect(foundCollapseContents).toHaveLength(3);
      });
    });
  });

  it('Renders headers', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
        />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        mockHeaderRenderer().forEach(async header => getByText(header));
      });
    });
  });

  it("Doesn't render header with showHeader set to false", async () => {
    const { queryAllByRole } = render(
      <ThemeProvider>
        <GenericList
          entries={[]}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
          showHeader={false}
        />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        const foundRows = queryAllByRole('row');
        expect(foundRows).toHaveLength(1);
        expect(
          queryByText(foundRows[0], defaultNotFoundText),
        ).toBeInTheDocument();
      });
    });
  });

  it('Renders extreaHeaderContent', async () => {
    const content = 'wow this is so extra!';
    const { getByText } = render(
      <ThemeProvider>
        <GenericList
          entries={mockEntries}
          headerRenderer={mockHeaderRenderer}
          rowRenderer={mockEntryRenderer}
          extraHeaderContent={<span>{content}</span>}
        />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(getByText(content)).toBeInTheDocument();
      });
    });
  });
});
