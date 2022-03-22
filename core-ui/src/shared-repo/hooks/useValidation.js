import { useState, useRef } from 'react';

export function useValidation({ inputRef, onChange }) {
  const [touched, setTouched] = useState(false);
  const internalRef = useRef(null);

  const ref = inputRef || internalRef;

  let validationState = {};
  if (ref.current && !ref.current?.validity?.valid && touched) {
    validationState = {
      state: 'error',
      text: ref.current?.validationMessage,
    };
  }

  return {
    validationState,
    ref,
    onChange: e => {
      if (Array.isArray(onChange)) {
        onChange.filter(oc => oc).forEach(oc => oc(e));
      } else if (onChange) {
        onChange(e);
      }
      const selectionStart = ref.current?.selectionStart;
      const selectionEnd = ref.current?.selectionEnd;
      setTouched(true);
      setTimeout(() => {
        if (ref.current && document.activeElement !== ref.current) {
          ref.current.focus();
          ref.current.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    },
  };
}
