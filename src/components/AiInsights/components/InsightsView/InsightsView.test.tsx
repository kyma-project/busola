import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { clusterAtom } from 'state/clusterAtom';
import { authDataAtom } from 'state/authDataAtom';
import { InsightsView } from './InsightsView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, v?: any) => (v ? `${k}:${JSON.stringify(v)}` : k),
  }),
}));

if (!window.matchMedia) {
  // jsdom doesn't ship matchMedia; themeAtom reads it on initial evaluation
  Object.defineProperty(window, 'matchMedia', {
    value: () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
}

const getInsightsMock = vi.fn();
vi.mock('../../api/getInsights', () => ({
  getInsights: (args: any) => getInsightsMock(args),
}));

vi.mock(
  'components/KymaCompanion/components/Chat/ContextLabel/ContextLabel',
  () => ({
    __esModule: true,
    default: ({ labelText }: any) => (
      <div data-testid="context-label">{labelText}</div>
    ),
  }),
);

const target = {
  resourceKind: 'Deployment',
  resourceName: 'my-app',
  resourceApiVersion: 'apps/v1',
  namespace: 'default',
};

function renderWithStore() {
  const store = createStore();
  store.set(clusterAtom as any, {
    currentContext: {
      cluster: {
        cluster: {
          server: 'https://cluster',
          'certificate-authority-data': 'ca',
        },
      },
    },
  });
  store.set(authDataAtom as any, { token: 'tok' });
  return render(
    <Provider store={store}>
      <InsightsView target={target} />
    </Provider>,
  );
}

describe('InsightsView', () => {
  beforeEach(() => {
    getInsightsMock.mockReset();
  });

  it('shows a busy indicator before the insights resolve', () => {
    getInsightsMock.mockReturnValue(new Promise(() => {}));
    renderWithStore();
    expect(document.querySelector('ui5-busy-indicator')).toBeInTheDocument();
    expect(document.querySelector('.markdown.message')).toBeNull();
  });

  it('renders the resolved insights text', async () => {
    getInsightsMock.mockResolvedValue('looks healthy');
    renderWithStore();
    await waitFor(() =>
      expect(
        document.querySelector('.markdown.message')?.textContent,
      ).toContain('looks healthy'),
    );
  });

  it('renders an error MessageStrip when the call fails', async () => {
    getInsightsMock.mockRejectedValue(new Error('boom'));
    renderWithStore();
    await waitFor(() =>
      expect(document.querySelector('ui5-message-strip')).toHaveTextContent(
        'boom',
      ),
    );
  });

  it('passes the K8s auth to getInsights', async () => {
    getInsightsMock.mockResolvedValue('ok');
    renderWithStore();
    await waitFor(() => expect(getInsightsMock).toHaveBeenCalled());
    expect(getInsightsMock.mock.calls[0][0].auth).toEqual({
      clusterUrl: 'https://cluster',
      certificateAuthorityData: 'ca',
      clusterToken: 'tok',
      clientCertificateData: undefined,
      clientKeyData: undefined,
    });
  });
});
