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
