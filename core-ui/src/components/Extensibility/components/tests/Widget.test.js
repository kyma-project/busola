import { render, waitFor } from 'testing/reactTestingUtils';
import { Widget } from '../Widget';
import { ExtensibilityTestWrapper } from './helpers';

jest.mock('components/Extensibility/ExtensibilityCreate', () => null);

const resource = {
  test: 'test-value',
};

describe('Widget', () => {
  describe('structure.visible', () => {
    it('not set -> render component as usual', async () => {
      const { findByText } = render(
        <ExtensibilityTestWrapper>
          <Widget value={resource} structure={{ source: '$.test' }} />
        </ExtensibilityTestWrapper>,
      );

      expect(await findByText('test-value'));
    });

    it('falsy (but not boolean "false") -> render component as usual', async () => {
      const { findByText } = render(
        <ExtensibilityTestWrapper>
          <Widget
            value={resource}
            structure={{ source: '$.test', visibility: null }}
          />
        </ExtensibilityTestWrapper>,
      );

      expect(await findByText('test-value'));
    });

    it('Explicitly false -> hide component', async () => {
      const { queryByText } = render(
        <ExtensibilityTestWrapper>
          <Widget
            value={resource}
            structure={{ source: '$.test', visibility: false }}
          />
        </ExtensibilityTestWrapper>,
      );

      await waitFor(() => {
        expect(queryByText(/loading/)).not.toBeInTheDocument();
        expect(queryByText(/test-value/)).not.toBeInTheDocument();
      });
    });

    it('jsonata error -> display error', async () => {
      console.warn = jest.fn();

      const { findByText } = render(
        <ExtensibilityTestWrapper>
          <Widget
            value={resource}
            structure={{ source: '$.test', visibility: '$undefinedMethod()' }}
          />
        </ExtensibilityTestWrapper>,
      );
      expect(await findByText('extensibility.configuration-error'));
    });

    it('jsonata -> control visibility', async () => {
      const { queryByText } = render(
        <ExtensibilityTestWrapper>
          <Widget
            value={resource}
            structure={{
              source: '$.test',
              visibility: '$contains($value, "test")',
            }}
          />
          <Widget
            value={resource}
            structure={{
              source: '$.test',
              visibility: '$contains($value, "not-test")',
            }}
          />
        </ExtensibilityTestWrapper>,
      );

      await waitFor(() => {
        expect(queryByText(/loading/)).not.toBeInTheDocument();

        // you have to use queryByText here because you expect `test-value` to be rendered only once
        // if there were more elements, it would be necessary to use `queryAllByText` and `queryByText` would fail
        expect(queryByText(/test-value/)).toBeInTheDocument();
      });
    });
  });
});
