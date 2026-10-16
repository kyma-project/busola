# Gardener paste-login (POC) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user paste a Gardener `gardenlogin` _shoot_ kubeconfig into Busola's Add Cluster wizard, supply their garden cluster (kubeconfig + token), and connect that shoot as a cluster.

**Architecture:** Busola cannot run the `kubectl-gardenlogin` exec plugin (browser SPA + stateless proxy), so it reimplements the plugin's one network step in JS: detect a gardenlogin shoot kubeconfig, read its `shootRef`, reach the garden cluster, `POST AdminKubeconfigRequest` for that single shoot, and connect the returned client-cert kubeconfig via the existing `addByContext` path. The dormant garden-wide flow stays and shares the same `requestAdminKubeconfig` helper.

**Tech Stack:** React 18 + TypeScript, Jotai, @ui5/webcomponents-react, Vitest (jsdom), js-yaml.

**Spec:** `docs/superpowers/specs/2026-10-07-gardener-paste-login-design.md`

## Global Constraints

- POC scope: garden auth is **static-token only** this iteration. OIDC-in-wizard (full-page redirect returning to the wizard) is deferred; detect it and show a clear "paste a token for now" message. (Testing the mint→connect core needs no IdP.)
- Coexist with the dormant `/gardener-login` flow — do **not** remove it; it must share the `requestAdminKubeconfig` helper.
- All new code under `src/components/Clusters/components/gardener/`.
- Work on a feature branch (not `main`): `feat/gardener-paste-login`.
- Commits: Conventional Commits (`feat:`/`refactor:`/`test:`), never mention AI tools (per AGENTS.md).
- Unit test runner: `npx vitest run <path>` (single run, not watch).
- Backend proxy address is `/backend` (`getClusterConfig().backendAddress`); auth is forwarded via `X-Cluster-Url` + `X-K8s-Authorization: Bearer <token>`.

---

### Task 0: Branch

- [ ] **Step 1: Create the feature branch**

```bash
git checkout -b feat/gardener-paste-login
```

---

### Task 1: gardenlogin detection + shootRef extraction

**Files:**

- Create: `src/components/Clusters/components/gardener/gardenlogin.ts`
- Test: `src/components/Clusters/components/gardener/test/gardenlogin.test.ts`

**Interfaces:**

- Produces: `isGardenloginKubeconfig(kubeconfig?: Kubeconfig): boolean`; `extractShootRef(kubeconfig?: Kubeconfig): ShootRef | null` where `ShootRef = { namespace: string; name: string; gardenClusterIdentity?: string }`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { isGardenloginKubeconfig, extractShootRef } from '../gardenlogin';

const base = {
  'current-context': 'shoot-external',
  contexts: [
    {
      name: 'shoot-external',
      context: { cluster: 'shoot-external', user: 'u' },
    },
  ],
  clusters: [
    {
      name: 'shoot-external',
      cluster: {
        server: 'https://api.shoot.example',
        extensions: [
          {
            name: 'client.authentication.k8s.io/exec',
            extension: {
              shootRef: { namespace: 'garden-proj', name: 'myshoot' },
              gardenClusterIdentity: 'landscape-x',
            },
          },
        ],
      },
    },
  ],
} as any;

const withUser = (user: any) =>
  ({ ...base, users: [{ name: 'u', user }] }) as any;

describe('isGardenloginKubeconfig', () => {
  it('matches command kubectl-gardenlogin', () => {
    expect(
      isGardenloginKubeconfig(
        withUser({
          exec: {
            command: 'kubectl-gardenlogin',
            args: ['get-client-certificate'],
          },
        }),
      ),
    ).toBe(true);
  });
  it('matches canonical command kubectl + gardenlogin arg', () => {
    expect(
      isGardenloginKubeconfig(
        withUser({
          exec: {
            command: 'kubectl',
            args: ['gardenlogin', 'get-client-certificate'],
          },
        }),
      ),
    ).toBe(true);
  });
  it('does not match an oidc-login exec', () => {
    expect(
      isGardenloginKubeconfig(
        withUser({
          exec: { command: 'kubectl', args: ['oidc-login', 'get-token'] },
        }),
      ),
    ).toBe(false);
  });
  it('does not match a static-token user', () => {
    expect(isGardenloginKubeconfig(withUser({ token: 'abc' }))).toBe(false);
  });
  it('handles undefined', () => {
    expect(isGardenloginKubeconfig(undefined)).toBe(false);
  });
});

describe('extractShootRef', () => {
  it('reads shootRef + identity from the current-context cluster extension', () => {
    expect(
      extractShootRef(
        withUser({
          exec: {
            command: 'kubectl-gardenlogin',
            args: ['get-client-certificate'],
          },
        }),
      ),
    ).toEqual({
      namespace: 'garden-proj',
      name: 'myshoot',
      gardenClusterIdentity: 'landscape-x',
    });
  });
  it('returns null when no exec extension is present', () => {
    const noExt = {
      ...base,
      clusters: [{ name: 'shoot-external', cluster: { server: 'x' } }],
      users: [{ name: 'u', user: {} }],
    } as any;
    expect(extractShootRef(noExt)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Clusters/components/gardener/test/gardenlogin.test.ts`
Expected: FAIL (module `../gardenlogin` not found).

- [ ] **Step 3: Write minimal implementation**

```ts
import { Kubeconfig, ValidKubeconfig } from 'types';

export type ShootRef = {
  namespace: string;
  name: string;
  gardenClusterIdentity?: string;
};

const GARDENLOGIN_ARG = 'gardenlogin';
const EXEC_EXTENSION_NAME = 'client.authentication.k8s.io/exec';

export function isGardenloginKubeconfig(kubeconfig?: Kubeconfig): boolean {
  const users = (kubeconfig as ValidKubeconfig | undefined)?.users ?? [];
  return users.some((u) => {
    const exec = (u?.user as { exec?: { command?: string; args?: string[] } })
      ?.exec;
    if (!exec?.command) return false;
    if (exec.command === 'kubectl-gardenlogin') return true;
    return exec.command === 'kubectl' && !!exec.args?.includes(GARDENLOGIN_ARG);
  });
}

export function extractShootRef(kubeconfig?: Kubeconfig): ShootRef | null {
  const kc = kubeconfig as ValidKubeconfig | undefined;
  if (!kc) return null;

  const contextName = kc['current-context'];
  const context =
    kc.contexts?.find((c) => c.name === contextName) ?? kc.contexts?.[0];
  const clusterName = context?.context?.cluster;
  const cluster =
    kc.clusters?.find((c) => c.name === clusterName) ?? kc.clusters?.[0];

  const extensions = (
    cluster?.cluster as { extensions?: Array<any> } | undefined
  )?.extensions;
  const ext = extensions?.find(
    (e) => e?.name === EXEC_EXTENSION_NAME,
  )?.extension;
  const shootRef = ext?.shootRef;
  if (!shootRef?.namespace || !shootRef?.name) return null;

  return {
    namespace: shootRef.namespace,
    name: shootRef.name,
    gardenClusterIdentity: ext?.gardenClusterIdentity,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Clusters/components/gardener/test/gardenlogin.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Clusters/components/gardener/gardenlogin.ts src/components/Clusters/components/gardener/test/gardenlogin.test.ts
git commit -m "feat: detect gardenlogin shoot kubeconfig and extract shootRef"
```

---

### Task 2: requestAdminKubeconfig helper

**Files:**

- Create: `src/components/Clusters/components/gardener/requestAdminKubeconfig.ts`
- Test: `src/components/Clusters/components/gardener/test/requestAdminKubeconfig.test.ts`

**Interfaces:**

- Consumes: `base64Decode` from `shared/helpers`.
- Produces: `requestAdminKubeconfig(args: { backendAddress: string; gardenServer: string; token: string; namespace: string; shootName: string; expirationSeconds?: number }): Promise<ValidKubeconfig>`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { requestAdminKubeconfig } from '../requestAdminKubeconfig';

afterEach(() => vi.restoreAllMocks());

describe('requestAdminKubeconfig', () => {
  it('POSTs AdminKubeconfigRequest and decodes status.kubeconfig', async () => {
    const mintedYaml = 'apiVersion: v1\nkind: Config\ncurrent-context: c\n';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: { kubeconfig: btoa(mintedYaml) } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await requestAdminKubeconfig({
      backendAddress: '/backend',
      gardenServer: 'https://garden.example',
      token: 'tok',
      namespace: 'garden-proj',
      shootName: 'myshoot',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      '/backend/apis/core.gardener.cloud/v1beta1/namespaces/garden-proj/shoots/myshoot/adminkubeconfig',
    );
    expect(init.method).toBe('POST');
    expect(init.headers['X-Cluster-Url']).toBe('https://garden.example');
    expect(init.headers['X-K8s-Authorization']).toBe('Bearer tok');
    expect(JSON.parse(init.body)).toMatchObject({
      apiVersion: 'authentication.gardener.cloud/v1alpha1',
      kind: 'AdminKubeconfigRequest',
      spec: { expirationSeconds: 10800 },
    });
    expect((result as any)['current-context']).toBe('c');
  });

  it('throws statusText on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, statusText: 'Forbidden' }),
    );
    await expect(
      requestAdminKubeconfig({
        backendAddress: '/backend',
        gardenServer: 'g',
        token: 't',
        namespace: 'n',
        shootName: 's',
      }),
    ).rejects.toThrow('Forbidden');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Clusters/components/gardener/test/requestAdminKubeconfig.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write minimal implementation**

```ts
import jsyaml from 'js-yaml';
import { base64Decode } from 'shared/helpers';
import { ValidKubeconfig } from 'types';

type AdminKubeconfigResponse = { status: { kubeconfig: string } };

export async function requestAdminKubeconfig({
  backendAddress,
  gardenServer,
  token,
  namespace,
  shootName,
  expirationSeconds = 3 * 60 * 60, // 3h
}: {
  backendAddress: string;
  gardenServer: string;
  token: string;
  namespace: string;
  shootName: string;
  expirationSeconds?: number;
}): Promise<ValidKubeconfig> {
  const url = `${backendAddress}/apis/core.gardener.cloud/v1beta1/namespaces/${namespace}/shoots/${shootName}/adminkubeconfig`;
  const payload = {
    apiVersion: 'authentication.gardener.cloud/v1alpha1',
    kind: 'AdminKubeconfigRequest',
    spec: { expirationSeconds },
  };

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      'X-Cluster-Url': gardenServer,
      'X-K8s-Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error(response.statusText);

  const result = (await response.json()) as AdminKubeconfigResponse;
  return jsyaml.load(base64Decode(result.status.kubeconfig)) as ValidKubeconfig;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Clusters/components/gardener/test/requestAdminKubeconfig.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Clusters/components/gardener/requestAdminKubeconfig.ts src/components/Clusters/components/gardener/test/requestAdminKubeconfig.test.ts
git commit -m "feat: add shared requestAdminKubeconfig helper for Gardener shoots"
```

---

### Task 3: garden kubeconfig token/server helpers

**Files:**

- Create: `src/components/Clusters/components/gardener/getGardenToken.ts`
- Test: `src/components/Clusters/components/gardener/test/getGardenToken.test.ts`

**Interfaces:**

- Produces: `getGardenServer(kc: ValidKubeconfig): string | undefined`; `getGardenStaticToken(kc: ValidKubeconfig): string | null`; `isGardenOidc(kc: ValidKubeconfig): boolean`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import {
  getGardenServer,
  getGardenStaticToken,
  isGardenOidc,
} from '../getGardenToken';

const tokenKc = {
  clusters: [{ name: 'g', cluster: { server: 'https://g' } }],
  users: [{ name: 'u', user: { token: 'abc' } }],
} as any;
const oidcKc = {
  clusters: [{ name: 'g', cluster: { server: 'https://g' } }],
  users: [
    {
      name: 'u',
      user: { exec: { command: 'kubectl', args: ['oidc-login', 'get-token'] } },
    },
  ],
} as any;

it('reads the garden server', () => {
  expect(getGardenServer(tokenKc)).toBe('https://g');
});
it('reads a static token', () => {
  expect(getGardenStaticToken(tokenKc)).toBe('abc');
});
it('returns null token for an oidc exec user', () => {
  expect(getGardenStaticToken(oidcKc)).toBeNull();
});
it('detects an oidc garden kubeconfig', () => {
  expect(isGardenOidc(oidcKc)).toBe(true);
  expect(isGardenOidc(tokenKc)).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Clusters/components/gardener/test/getGardenToken.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write minimal implementation**

```ts
import { KubeconfigOIDCAuth, ValidKubeconfig } from 'types';

export function getGardenServer(kc: ValidKubeconfig): string | undefined {
  return kc?.clusters?.[0]?.cluster?.server;
}

export function getGardenStaticToken(kc: ValidKubeconfig): string | null {
  const user = kc?.users?.[0]?.user;
  if (user && 'token' in user && user.token) return user.token as string;
  return null;
}

export function isGardenOidc(kc: ValidKubeconfig): boolean {
  const user = kc?.users?.[0]?.user;
  return !!(user && !('token' in user) && (user as KubeconfigOIDCAuth).exec);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Clusters/components/gardener/test/getGardenToken.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Clusters/components/gardener/getGardenToken.ts src/components/Clusters/components/gardener/test/getGardenToken.test.ts
git commit -m "feat: add garden kubeconfig token/server helpers"
```

---

### Task 4: GardenerLoginStep component + i18n keys

**Files:**

- Create: `src/components/Clusters/components/gardener/GardenerLoginStep.tsx`
- Modify: `public/i18n/en.yaml` (extend the existing `clusters.gardener` block near line 101)

**Interfaces:**

- Consumes: `extractShootRef` (Task 1), `requestAdminKubeconfig` (Task 2), `getGardenServer`/`getGardenStaticToken`/`isGardenOidc` (Task 3), `addByContext` from `components/Clusters/shared`, `getClusterConfig` from `state/utils/getBackendInfo`, `useClustersInfo` from `state/utils/getClustersInfo`.
- Produces: `GardenerLoginStep(props: { shootKubeconfig: Kubeconfig; config: any; onCancel: () => void; onConnected: () => void }): JSX.Element`.

- [ ] **Step 1: Add i18n keys**

Under the existing `clusters:` → `gardener:` block in `public/i18n/en.yaml` (which already has `button` and `error`), add:

```yaml
gardener:
  button: Connect a Gardener cluster
  error: 'Connecting clusters failed: {{message}}.'
  wizard-title: Connect a Gardener shoot
  detected: 'Detected Gardener shoot "{{name}}" in namespace {{namespace}} (landscape: {{identity}}).'
  garden-kubeconfig-label: Garden cluster kubeconfig
  token-label: Garden token
  token-hint: Paste a bearer token for the garden cluster (e.g. from `kubectl oidc-login get-token`). Required while OIDC login in the wizard is not yet available.
  connect: Connect shoot
  errors:
    no-shoot-ref: This kubeconfig has no Gardener shootRef; it is not a supported gardenlogin kubeconfig.
    garden-parse: Could not parse the garden kubeconfig YAML.
    no-garden-server: The garden kubeconfig has no cluster server URL.
    no-token: Paste a garden token to continue.
    oidc-not-supported: This garden kubeconfig uses OIDC. In-wizard OIDC login is not available yet — paste a garden token instead.
```

(Keep the existing `button`/`error` values; only add the new keys.)

- [ ] **Step 2: Write the component**

```tsx
import { useState } from 'react';
import {
  Button,
  MessageStrip,
  TextArea,
  Title,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { getClusterConfig } from 'state/utils/getBackendInfo';
import { addByContext } from 'components/Clusters/shared';
import { Kubeconfig, KubeconfigContext, ValidKubeconfig } from 'types';
import { extractShootRef } from './gardenlogin';
import { requestAdminKubeconfig } from './requestAdminKubeconfig';
import {
  getGardenServer,
  getGardenStaticToken,
  isGardenOidc,
} from './getGardenToken';

type Props = {
  shootKubeconfig: Kubeconfig;
  config: any;
  onCancel: () => void;
  onConnected: () => void;
};

export function GardenerLoginStep({
  shootKubeconfig,
  config,
  onCancel,
  onConnected,
}: Props) {
  const { t } = useTranslation();
  const clustersInfo = useClustersInfo();
  const shootRef = extractShootRef(shootKubeconfig);

  const [gardenText, setGardenText] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    setError(null);
    if (!shootRef) return setError(t('clusters.gardener.errors.no-shoot-ref'));

    let garden: ValidKubeconfig;
    try {
      garden = jsyaml.load(gardenText) as ValidKubeconfig;
    } catch {
      return setError(t('clusters.gardener.errors.garden-parse'));
    }

    const gardenServer = getGardenServer(garden);
    if (!gardenServer)
      return setError(t('clusters.gardener.errors.no-garden-server'));

    const token = getGardenStaticToken(garden) || tokenInput.trim();
    if (!token) {
      return setError(
        isGardenOidc(garden)
          ? t('clusters.gardener.errors.oidc-not-supported')
          : t('clusters.gardener.errors.no-token'),
      );
    }

    setBusy(true);
    try {
      const { backendAddress } = getClusterConfig();
      const minted = await requestAdminKubeconfig({
        backendAddress,
        gardenServer,
        token,
        namespace: shootRef.namespace,
        shootName: shootRef.name,
      });
      const contextName = minted['current-context'];
      const context = minted.contexts.find(
        (c) => c.name === contextName,
      ) as KubeconfigContext;
      addByContext(
        {
          kubeconfig: minted as Kubeconfig,
          context,
          storage: 'sessionStorage',
          config,
        },
        clustersInfo,
      );
      onConnected();
    } catch (e) {
      setError(t('clusters.gardener.error', { message: (e as Error).message }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="add-cluster__content-container">
      <Title level="H5" className="sap-margin-bottom-small">
        {t('clusters.gardener.wizard-title')}
      </Title>
      <MessageStrip
        design="Information"
        hideCloseButton
        className="sap-margin-bottom-small"
      >
        {shootRef
          ? t('clusters.gardener.detected', {
              name: shootRef.name,
              namespace: shootRef.namespace,
              identity: shootRef.gardenClusterIdentity ?? '-',
            })
          : t('clusters.gardener.errors.no-shoot-ref')}
      </MessageStrip>

      <label>{t('clusters.gardener.garden-kubeconfig-label')}</label>
      <TextArea
        rows={8}
        value={gardenText}
        onInput={(e) => setGardenText((e.target as HTMLTextAreaElement).value)}
      />

      <label className="sap-margin-top-small">
        {t('clusters.gardener.token-label')}
      </label>
      <TextArea
        rows={3}
        value={tokenInput}
        placeholder={t('clusters.gardener.token-hint')}
        onInput={(e) => setTokenInput((e.target as HTMLTextAreaElement).value)}
      />

      {error && (
        <MessageStrip
          design="Negative"
          hideCloseButton
          className="sap-margin-top-small"
        >
          {error}
        </MessageStrip>
      )}

      <div className="sap-margin-top-small">
        <Button design="Transparent" onClick={onCancel} disabled={busy}>
          {t('common.buttons.cancel')}
        </Button>
        <Button
          design="Emphasized"
          onClick={connect}
          disabled={busy || !shootRef}
        >
          {t('clusters.gardener.connect')}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i gardener`
Expected: no output (no type errors in the new file). If `common.buttons.cancel` does not exist, use the existing cancel key (`grep -n "cancel:" public/i18n/en.yaml` → use `clusters.buttons...` or `common.buttons.cancel` as present).

- [ ] **Step 4: Commit**

```bash
git add src/components/Clusters/components/gardener/GardenerLoginStep.tsx public/i18n/en.yaml
git commit -m "feat: add Gardener shoot connect step for the Add Cluster wizard"
```

---

### Task 5: Branch the Add Cluster wizard on gardenlogin detection

**Files:**

- Modify: `src/components/Clusters/components/AddClusterWizard.tsx`

**Interfaces:**

- Consumes: `isGardenloginKubeconfig` (Task 1), `GardenerLoginStep` (Task 4).

- [ ] **Step 1: Add imports**

At the top of `AddClusterWizard.tsx`, with the other `./` imports:

```tsx
import { isGardenloginKubeconfig } from './gardener/gardenlogin';
import { GardenerLoginStep } from './gardener/GardenerLoginStep';
```

- [ ] **Step 2: Add the early-return branch**

Immediately before the existing `return (` of `AddClusterWizard` (after `checkRequiredInputs` is defined), insert:

```tsx
if (kubeconfig && isGardenloginKubeconfig(kubeconfig)) {
  return (
    <GardenerLoginStep
      shootKubeconfig={kubeconfig}
      config={config}
      onCancel={onCancel}
      onConnected={() => {
        setIsFormOpen({ formOpen: false });
        setShowWizard(false);
        updateKubeconfig();
      }}
    />
  );
}
```

This keeps the normal wizard (including step 1 `KubeconfigUpload`) for all other kubeconfigs; the branch only triggers after the user pastes a gardenlogin shoot kubeconfig (so `kubeconfig` is already populated), swapping the body to the Gardener step.

- [ ] **Step 3: Manual verification**

1. In `public/defaultConfig.yaml`, ensure the add-cluster entry is reachable (default). Run `npm start`.
2. Open Add Cluster → paste the gardenlogin shoot kubeconfig (`~/Downloads/kubeconfig-gardenlogin--hasselhoff--eil8mm5p1s.yaml`).
3. Expected: the wizard body swaps to "Connect a Gardener shoot" showing the detected shoot (`eil8mm5p1s` / `garden-hasselhoff` / `sap-landscape-canary`).
4. Paste your garden kubeconfig + a garden token (`kubectl --kubeconfig <garden> oidc-login get-token … | jq -r .status.token`), click Connect shoot.
5. Expected: `AdminKubeconfigRequest` 200 in the Network tab, the shoot is added as a cluster, dialog closes. On 403/404, the Negative MessageStrip shows the error.

- [ ] **Step 4: Commit**

```bash
git add src/components/Clusters/components/AddClusterWizard.tsx
git commit -m "feat: route gardenlogin kubeconfigs to the Gardener connect step"
```

---

### Task 6: Refactor the dormant garden-wide flow to share the helper

**Files:**

- Modify: `src/components/Gardener/useGardenerLoginFunction.tsx`

**Interfaces:**

- Consumes: `requestAdminKubeconfig` (Task 2).

- [ ] **Step 1: Thread server/token into `getKubeconfigs` and call the shared helper**

Replace the `getKubeconfigs` signature and its inner `AdminKubeconfigRequest` POST so it reuses `requestAdminKubeconfig`. Concretely:

- Add import: `import { requestAdminKubeconfig } from 'components/Clusters/components/gardener/requestAdminKubeconfig';`
- Change `getKubeconfigs` to accept `(serverAddress: string, token: string, availableProjects: string[])` instead of `(fetchHeaders, availableProjects)` for the mint call. Keep the shoots **list** call using `fetchHeaders` (unchanged).
- Replace the per-shoot block that builds `payload` + `kubeconfigUrl` + POST (current lines ~91-105) with:

```tsx
const kubeconfig = await requestAdminKubeconfig({
  backendAddress,
  gardenServer: serverAddress,
  token,
  namespace: `garden-${project}`,
  shootName: shoot.metadata.name,
});
kubeconfigs.push(kubeconfig);
```

- Update the final returned function to call `getKubeconfigs(serverAddress, token, availableProjects)` and keep passing `fetchHeaders` into the shoots-list fetch (pass both into `getKubeconfigs`, or keep `fetchHeaders` built inside). Simplest: keep `fetchHeaders` built in the returned function and pass `serverAddress`, `token`, and `fetchHeaders` to `getKubeconfigs`.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i gardener`
Expected: no output.

- [ ] **Step 3: Verify the full suite still passes**

Run: `npx vitest run src/components/Clusters/components/gardener`
Expected: PASS (all gardener unit tests).

- [ ] **Step 4: Commit**

```bash
git add src/components/Gardener/useGardenerLoginFunction.tsx
git commit -m "refactor: share requestAdminKubeconfig between gardenlogin flows"
```

---

## Self-Review

- **Spec coverage:** detection both forms (Task 1) ✓; shootRef namespace from file, no `garden-<project>` hardcode (Task 1) ✓; `AdminKubeconfigRequest` mint (Task 2) ✓; connect via client-cert path — reuses `addByContext`/`createHeaders` ✓; prompt-for-garden + static-token POC (Tasks 4-5) ✓; coexist + shared helper (Task 6) ✓; unit tests for detector + helper + token helpers ✓.
- **Deferred vs spec (flagged):** (a) **OIDC-in-wizard** is deferred to token-only — the spec allowed both; this POC does token now (noted in Global Constraints). (b) **Multi-cluster server-URL selection** — the minted admin kubeconfig is added via its own `current-context` (Gardener sets this to the reachable/external cluster), which is sufficient for the POC; revisit if a landscape returns a non-external current-context. (c) Full Cypress integration — deferred per spec.
- **Placeholder scan:** none — every step has runnable code/commands.
- **Type consistency:** `ShootRef`, `requestAdminKubeconfig` args, and `getGarden*` signatures are used identically in Tasks 4 and 6.
