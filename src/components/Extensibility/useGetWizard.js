import { useAtomValue } from 'jotai';
import { wizardState } from 'state/navigation/extensionsAtom';

export const useGetWizard = wizardName => {
  const wizards = useAtomValue(wizardState);

  const resource = wizards.find(el => {
    const { id } = el.general || {};

    if (id === wizardName) return el;
    else return null;
  });

  return resource;
};
