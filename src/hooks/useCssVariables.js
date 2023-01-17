import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';

function computeVariables(variableMapping) {
  const style = getComputedStyle(document.body);

  const obj = {};
  for (const [name, cssName] of Object.entries(variableMapping)) {
    obj[name] = style.getPropertyValue(cssName);
  }
  return obj;
}

export function useCssVariables(variableMapping) {
  const theme = useRecoilValue(themeState);
  const [variables, setVariables] = useState(() =>
    computeVariables(variableMapping),
  );

  useEffect(() => {
    setTimeout(() => {
      setVariables(computeVariables(variableMapping));
      // wait for stylesheet to reload
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, JSON.stringify(variableMapping)]);

  return variables;
}
