import { Table } from '../Table';
import { render } from '@testing-library/react';

jest.mock('shared/components/MonacoEditorESM/Editor', () => ({
  'monaco-editor': () => 'blah',
}));

describe('Table', () => {
  it('Renders title', () => {
    const { debug } = render(
      <Table
        value={[]}
        structure={{
          path: 'resource.array-data',
          children: [],
          name: 'my-title',
        }}
      />,
    );

    debug();
  });
});
