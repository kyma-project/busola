import { useAtomValue } from 'jotai';
import { wizardAtom } from 'state/navigation/extensionsAtom';

export const useGetWizard = (wizardName) => {
  const wizards = useAtomValue(wizardAtom);

  const resource = wizards.find((el) => {
    const { id } = el.general || {};

    if (id === wizardName) return el;
    else return null;
  });

  return resource;
};
