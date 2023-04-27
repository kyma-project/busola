import { useRecoilValue } from 'recoil';
import { injectionsState } from 'state/navigation/extensionsAtom';

export const useGetInjections = (location, slot) => {
  const injections = useRecoilValue(injectionsState);
  let filteredInjections = [];

  (injections || []).forEach(injection => {
    const target = injection.injection.targets.find(
      t => t.location === location && t.slot === slot,
    );
    if (target) {
      filteredInjections.push({
        ...injection,
        injection: {
          ...injection.injection,
          target: target,
        },
      });
    }
  });

  filteredInjections.sort(
    (a, b) =>
      a.injection?.order - b.injection?.order ||
      a.injection.name.localeCompare(b.injection.name),
  );

  return filteredInjections;
};
