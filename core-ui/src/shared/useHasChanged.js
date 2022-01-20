import React from 'react';

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
