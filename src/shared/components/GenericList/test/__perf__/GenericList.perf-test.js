import { render } from '@testing-library/react';
import { measureRenders } from 'reassure';
import { GenericList } from '../../GenericList';

const mockHeaderRenderer = () => ['Id', 'Name', 'description'];
const mockEntryRenderer = (entry) => [entry.id, entry.name, entry.description];

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

test('Button renders efficiently', async () => {
  await measureRenders(() => {
    render(
      <GenericList
        entries={mockEntries}
        headerRenderer={mockHeaderRenderer}
        rowRenderer={mockEntryRenderer}
      />,
    );
  });
});
