import { render } from 'testing/reactTestingUtils';
import { Selector } from '../Selector';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { cleanup } from '@testing-library/react';

vi.mock('../../RelatedPods.js', () => ({
  RelatedPods: ({ namespace }) => <div>Related Pods for {namespace}</div>,
}));

describe('Selector tests', () => {
  afterAll(async () => {
    await cleanup();
    await vi.mockReset();
    await vi.clearAllMocks();
    await vi.useRealTimers();
  });

  describe('Selector tests for Kubernetes resources', () => {
    it('Does not render Selector when selector is null', () => {
      const { queryByText } = render(
        <ThemeProvider>
          <Selector selector={null} />
        </ThemeProvider>,
      );

      expect(queryByText('selector.title')).not.toBeInTheDocument();
    });

    it('Renders default message when selector labels are null', () => {
      const mockedSelector = {};

      const { getByText } = render(
        <ThemeProvider>
          <Selector selector={mockedSelector} />
        </ThemeProvider>,
      );

      expect(getByText('selector.message.empty-selector')).toBeInTheDocument();
    });

    it('Renders Selector with labels and pods list', () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };

      const { getByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            namespace="test-namespace"
            labels={mockedSelector.matchLabels}
          />
        </ThemeProvider>,
      );

      expect(getByText('Related Pods for test-namespace')).toBeInTheDocument();
      expect(getByText('test=test')).toBeInTheDocument(); // selector labels
    });

    it('Renders Selector with matchExpressions and without pods list', () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
        matchExpressions: [
          { key: 'test-key', operator: 'In', values: ['test-value'] },
        ],
      };

      const { getByText, getAllByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            namespace="namespace"
            labels={mockedSelector.matchLabels}
            expressions={mockedSelector.matchExpressions}
          />
        </ThemeProvider>,
      );

      expect(getAllByText('match-expressions.title')[0]).toBeInTheDocument(); //title of the matchExpressions table
      expect(getAllByText('test=test')[0]).toBeInTheDocument();
      expect(getByText('test-key')).toBeInTheDocument(); // matchExpressions elements
      expect(getByText('In')).toBeInTheDocument();
    });

    it('Renders custom message when selector labels are null ', () => {
      const mockedSelector = {};
      const { getByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            message={'Matches all PersistentVolumes'}
          />
        </ThemeProvider>,
      );

      expect(getByText('Matches all PersistentVolumes')).toBeInTheDocument();
    });

    it('Renders Selector with custom RelatedResources', () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };
      const { getByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            labels={mockedSelector.matchLabels}
            namespace="namespace"
            RelatedResources={() => <p>Persistent Volumes</p>}
          />
        </ThemeProvider>,
      );

      expect(getByText('Persistent Volumes')).toBeInTheDocument();
    });
  });

  describe('Selector tests for Istio resources', () => {
    it('Renders message when selector is null', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Selector selector={null} isIstioSelector />
        </ThemeProvider>,
      );

      expect(getByText('selector.message.empty-selector')).toBeInTheDocument();
    });

    it('Renders Selector with custom title', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Selector selector={null} title={'Custom Title'} isIstioSelector />
        </ThemeProvider>,
      );

      expect(getByText('Custom Title')).toBeInTheDocument();
    });

    it('Renders Selector with non-empty labels', () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };

      const { getByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            labels={mockedSelector.matchLabels}
            namespace="namespace"
            isIstioSelector
            RelatedResources={() => <p>Custom Resources</p>}
          />
        </ThemeProvider>,
      );

      expect(getByText('Custom Resources')).toBeInTheDocument();
      expect(getByText('test=test')).toBeInTheDocument();
    });
  });
});
