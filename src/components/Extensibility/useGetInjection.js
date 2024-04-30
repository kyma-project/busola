import { useRecoilValue } from 'recoil';
import { injectionsState } from 'state/navigation/extensionsAtom';

export const useGetInjections = (location, slot) => {
  const injections = useRecoilValue(injectionsState);
  let filteredInjections = [];

  (injections || []).forEach(injection => {
    const target = injection.injection.targets.find(
      t =>
        t.location?.toLowerCase() === location?.toLowerCase() &&
        t.slot?.toLowerCase() === slot?.toLowerCase(),
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
  if (filteredInjections.length !== 0) {
    filteredInjections.sort((a, b) => {
      if (a.injection?.order && b.injection?.order)
        return a.injection?.order - b.injection?.order;
      else if (a.injection.name && b.injection.name)
        return a.injection.name.localeCompare(b.injection.name);
      else return a;
    });
  }

  return filteredInjections;
};
