import { useEffect, useState } from 'react';
import { useTheme } from 'shared/contexts/ThemeContext';

function computeVariables(variableMapping, selector = document.body) {
  // const canvas = document.querySelector('canvas.stats-graph');
  console.log(selector);
  if (!selector) return null;
  const style = getComputedStyle(selector);
  console.log('s', style);
  const obj = {};
  for (const [name, cssName] of Object.entries(variableMapping)) {
    obj[name] = style.getPropertyValue(cssName);
  }
  return obj;
}

export function useCssVariables(variableMapping, selector, values) {
  const { theme } = useTheme();
  const [variables, setVariables] = useState(() =>
    computeVariables(variableMapping, selector),
  );

  useEffect(() => {
    const watchCss = setTimeout(() => {
      setVariables(computeVariables(variableMapping, selector));
      // wait for stylesheet to reload
    }, 100);

    return () => clearTimeout(watchCss);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, JSON.stringify(variableMapping), values]);

  return variables;
}
