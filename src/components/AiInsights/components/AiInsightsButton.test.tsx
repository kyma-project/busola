import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import { AiInsightsButton } from './AiInsightsButton';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const resource = {
  kind: 'Deployment',
  apiVersion: 'apps/v1',
  metadata: {
    name: 'my-app',
    namespace: 'default',
    uid: 'u',
    creationTimestamp: '',
    resourceVersion: '',
    labels: {},
  },
};

function renderWithStore(ui: React.ReactNode) {
  const store = createStore();
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}

describe('AiInsightsButton', () => {
  it('renders a button when resource has kind and name', () => {
    renderWithStore(<AiInsightsButton resource={resource} />);
    expect(document.querySelector('ui5-button')).toBeInTheDocument();
  });

  it('renders nothing when resource is missing kind', () => {
    const { container } = renderWithStore(
      <AiInsightsButton resource={{ ...resource, kind: undefined }} />,
    );
    expect(container.querySelector('button, ui5-button')).toBeNull();
  });

  it('sets insightsTarget on showKymaCompanionAtom when clicked', () => {
    const { store } = renderWithStore(<AiInsightsButton resource={resource} />);

    const button = document.querySelector('ui5-button')!;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(store.get(showKymaCompanionAtom)).toEqual({
      show: true,
      fullScreen: false,
      useJoule: false,
      insightsTarget: {
        resourceKind: 'Deployment',
        resourceName: 'my-app',
        resourceApiVersion: 'apps/v1',
        namespace: 'default',
      },
    });
  });

  it('defaults missing namespace to empty string (cluster-scoped resource)', () => {
    const clusterScoped = {
      ...resource,
      kind: 'Namespace',
      apiVersion: 'v1',
      metadata: { ...resource.metadata, namespace: undefined },
    };
    const { store } = renderWithStore(
      <AiInsightsButton resource={clusterScoped} />,
    );

    document
      .querySelector('ui5-button')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(store.get(showKymaCompanionAtom).insightsTarget?.namespace).toBe('');
  });
});
