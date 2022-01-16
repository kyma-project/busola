import { useState, useRef } from 'react';

export function useValidation({ ref, onChange }) {
  const [touched, setTouched] = useState(false);
  const internalRef = useRef(null);

  const inputRef = ref || internalRef;

  let validationState;
  if (!inputRef.current?.validity?.valid && touched) {
    validationState = {
      state: 'error',
      text: inputRef.current?.validationMessage,
    };
  }

  return {
    validationState,
    inputRef,
    onChange: e => {
      // console.log('onChange');
      if (Array.isArray(onChange)) {
        onChange.filter(oc => oc).forEach(oc => oc(e));
      } else if (onChange) {
        onChange(e);
      }
      setTouched(true);
      setTimeout(() => {
        // console.log('not active?', document.activeElement !== inputRef.current);
        if (document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      });
    },
  };
}
