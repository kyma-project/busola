import { useEffect, useState } from 'react';
import { useTheme } from 'shared/contexts/ThemeContext';

function computeVariables(variableMapping) {
  const style = getComputedStyle(document.body);

  const obj = {};
  for (const [name, cssName] of Object.entries(variableMapping)) {
    obj[name] = style.getPropertyValue(cssName);
  }
  return obj;
}

export function useCssVariables(variableMapping) {
  const { theme } = useTheme();
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
