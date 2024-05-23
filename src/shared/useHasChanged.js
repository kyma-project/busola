import React from 'react';

/**
 * Returns a function checking if the provided argument changed between renders.
 * If you want to compare two values, call the hook twice.
 * @param log
 * @returns {function(*): boolean}
 */
export function useHasChanged(log = true) {
  const ref = React.useRef(null);

  return React.useCallback(
    variable => {
      const hasChanged = ref.current !== variable;
      if (log) {
        console.log('has changed: ', hasChanged);
      }
      ref.current = variable;
      return hasChanged;
    },
    [log],
  );
}
