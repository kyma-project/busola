import { renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { JotaiHydrator } from 'testing/reactTestingUtils';
import { disableResourceProtectionAtom } from 'state/settings/disableResourceProtectionAtom';
import { useProtectedResources } from '../useProtectedResources';

let featureValue;
vi.mock('hooks/useFeature', () => ({
  useFeature: () => featureValue,
}));

function makeWrapper(disableProtection = false) {
  return ({ children }) => (
    <Provider>
      <JotaiHydrator
        initialValues={[[disableResourceProtectionAtom, disableProtection]]}
      >
        {children}
      </JotaiHydrator>
    </Provider>
  );
}

const namespaceEntry = {
  kind: 'Namespace',
  metadata: { name: 'kube-system' },
};

beforeEach(() => {
  featureValue = { isEnabled: false };
});

describe('useProtectedResources', () => {
  it('exposes no rules when the feature is disabled', () => {
    featureValue = {
      isEnabled: false,
      config: { resources: [{ match: { '$.kind': 'Namespace' } }] },
    };

    const { result } = renderHook(() => useProtectedResources(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.protectedResourceRules).toEqual([]);
    expect(result.current.isProtectedResource(namespaceEntry)).toBe(false);
  });

  it('matches a resource by an exact value rule', () => {
    featureValue = {
      isEnabled: true,
      config: { resources: [{ match: { '$.kind': 'Namespace' } }] },
    };

    const { result } = renderHook(() => useProtectedResources(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isProtectedResource(namespaceEntry)).toBe(true);
    expect(
      result.current.isProtectedResource({ kind: 'Pod', metadata: {} }),
    ).toBe(false);
  });

  it('matches a resource by a regex rule', () => {
    featureValue = {
      isEnabled: true,
      config: {
        resources: [{ regex: true, match: { '$.metadata.name': '^kube-' } }],
      },
    };

    const { result } = renderHook(() => useProtectedResources(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isProtectedResource(namespaceEntry)).toBe(true);
    expect(
      result.current.isProtectedResource({
        kind: 'Namespace',
        metadata: { name: 'my-app' },
      }),
    ).toBe(false);
  });

  it('never matches a rule whose match is null', () => {
    featureValue = {
      isEnabled: true,
      config: { resources: [{ match: null }] },
    };

    const { result } = renderHook(() => useProtectedResources(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.getEntryProtection(namespaceEntry)).toEqual([]);
    expect(result.current.isProtectedResource(namespaceEntry)).toBe(false);
  });

  it('isProtected is false when the user disabled resource protection', () => {
    featureValue = {
      isEnabled: true,
      config: { resources: [{ match: { '$.kind': 'Namespace' } }] },
    };

    const { result } = renderHook(() => useProtectedResources(), {
      wrapper: makeWrapper(true),
    });

    expect(result.current.isProtectedResource(namespaceEntry)).toBe(true);
    expect(result.current.isProtected(namespaceEntry)).toBe(false);
  });

  it('isProtected blocks a protected resource when protection is enabled', () => {
    featureValue = {
      isEnabled: true,
      config: { resources: [{ match: { '$.kind': 'Namespace' } }] },
    };

    const { result } = renderHook(() => useProtectedResources(), {
      wrapper: makeWrapper(false),
    });

    expect(result.current.isProtected(namespaceEntry)).toBe(true);
  });
});
