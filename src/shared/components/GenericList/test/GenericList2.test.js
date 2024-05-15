import { render, waitFor, act } from 'testing/reactTestingUtils';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ThemeProvider } from '@ui5/webcomponents-react';

describe('GenericList2', () => {
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

  it('Renders with minimal props', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <GenericList
          title=""
          entries={[]}
          headerRenderer={() => []}
          rowRenderer={() => []}
        />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(getByText(defaultNotFoundText)).toBeInTheDocument();
      });
    });
  });

  it('Renders custom notFoundMessage props', async () => {
    const notFoundMessage = 'abcd';
    const { getByText } = render(
      <ThemeProvider>
        <GenericList
          title=""
          entries={[]}
          headerRenderer={() => []}
          rowRenderer={() => []}
          notFoundMessage={notFoundMessage}
        />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(getByText(notFoundMessage)).toBeInTheDocument();
      });
    });
  });

  it('Renders title', async () => {
    const title = 'title';
    const { getByText } = render(
      <ThemeProvider>
        <GenericList
          title={title}
          entries={[]}
          headerRenderer={() => []}
          rowRenderer={() => []}
        />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(getByText(title)).toBeInTheDocument();
      });
    });
  });

  describe('Search', () => {
    it('Show search field by default', async () => {
      const { getByRole } = render(
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
          expect(getByRole('search')).toBeInTheDocument();
        });
      });
    });

    it("Doesn't show search field when showSearchField is set to false", async () => {
      const { queryByRole } = render(
        <ThemeProvider>
          <GenericList
            entries={mockEntries}
            headerRenderer={mockHeaderRenderer}
            rowRenderer={mockEntryRenderer}
            searchSettings={{
              showSearchField: false,
            }}
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(queryByRole('search')).toBeNull();
        });
      });
    });

    it('Shows server error message if dataError prop is true', async () => {
      const serverErrorMessage = {
        message: 'Something failed',
        originalMessage: '',
      };

      const { queryAllByRole, getByText } = render(
        <ThemeProvider>
          <GenericList
            entries={[]}
            headerRenderer={mockHeaderRenderer}
            rowRenderer={mockEntryRenderer}
            serverDataError={serverErrorMessage}
          />
        </ThemeProvider>,
      );

      await waitFor(async () => {
        await act(async () => {
          expect(queryAllByRole('row')).toHaveLength(1);
          expect(
            getByText(new RegExp(serverErrorMessage.message, 'i')),
          ).toBeInTheDocument();
        });
      });
    });

    it('Shows Spinner if dataLoading prop is true', async () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <GenericList
            entries={[]}
            headerRenderer={mockHeaderRenderer}
            rowRenderer={mockEntryRenderer}
            serverDataLoading={true}
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(getByLabelText('Loading')).toBeInTheDocument();
        });
      });
    });
  });
});
