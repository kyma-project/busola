import { K8sResource } from 'types';
import { TFunction } from 'i18next';
import { CommandPaletteContext } from 'command-pallette/CommandPalletteUI/types';

export function fixCRD(name: string): K8sResource {
  return {
    metadata: {
      name: name,
      uid: '',
      creationTimestamp: '',
      resourceVersion: '',
      labels: {},
    },
  };
}

const fakeTranslation: Record<string, string> = {
  'custom-resource-definitions.title': 'TEST',
};

const fakeT = ((key: string) => fakeTranslation[key] ?? key) as TFunction;

export function fixContext({
  tokens,
  resourceCache = {},
  fetch = (_: string) => new Promise(() => undefined),
  updateResourceCache = (_: string, __: K8sResource[]) => {},
}: {
  tokens: string[];
  resourceCache?: Record<string, K8sResource[]>;
  fetch?: (a: string) => Promise<any>;
  updateResourceCache?: (key: string, value: K8sResource[]) => void;
}): CommandPaletteContext {
  // @ts-expect-error Other fields are not needed
  return {
    resourceCache,
    t: fakeT,
    updateResourceCache,
    tokens,
    fetch,
  };
}
