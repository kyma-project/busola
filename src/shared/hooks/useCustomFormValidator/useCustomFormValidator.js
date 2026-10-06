import { useState, useRef } from 'react';
import { validateFormElement } from './validateFormElement';

export function useCustomFormValidator() {
  const formElementRef = useRef(null);
  const [isValid, setValid] = useState(true);
  const [customValid, setCustomValid] = useState(true);

  const revalidate = (cv = customValid) => {
    // Has to adjusted after every Resource Form structure change
    const formContainer =
      formElementRef.current?.querySelector('.resource-form');
    if (formContainer) {
      if (formContainer.children.length > 0) {
        setValid(cv && validateFormElement(formContainer, true).valid);
      } else {
        // Form has no visible fields (e.g. YAML mode) — validity follows cv directly
        setValid(cv);
      }
    }
  };

  return {
    isValid,
    formElementRef,
    setCustomValid: (val) => {
      setCustomValid(val);
      revalidate(val);
    },
    revalidate,
  };
}
