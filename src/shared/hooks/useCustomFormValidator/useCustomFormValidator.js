import { useState, useRef } from 'react';
import { validateFormElement } from './validateFormElement';

export function useCustomFormValidator() {
  const formElementRef = useRef(null);
  const [isValid, setValid] = useState(true);
  const [customValid, setCustomValid] = useState(true);
  const emptyFieldsRef = useRef([]);
  const invalidFormatFieldsRef = useRef([]);

  const revalidate = (cv = customValid) => {
    // Has to be adjusted after every Resource Form structure change
    const formContainer =
      formElementRef.current?.querySelector('.resource-form');
    if (formContainer) {
      if (formContainer.children.length > 0) {
        const result = validateFormElement(formContainer, true);
        setValid(cv && result.valid);
        emptyFieldsRef.current = result.emptyFields || [];
        invalidFormatFieldsRef.current = result.invalidFormatFields || [];
      } else {
        // Form has no visible fields (e.g. YAML mode) — validity follows cv directly
        setValid(cv);
        emptyFieldsRef.current = [];
        invalidFormatFieldsRef.current = [];
      }
    }
  };

  return {
    isValid,
    emptyFieldsRef,
    invalidFormatFieldsRef,
    formElementRef,
    setCustomValid: (val) => {
      setCustomValid(val);
      revalidate(val);
    },
    revalidate,
  };
}
