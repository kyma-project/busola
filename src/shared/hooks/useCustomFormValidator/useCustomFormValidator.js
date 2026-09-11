import { useState, useRef } from 'react';
import { validateFormElement } from './validateFormElement';

export function useCustomFormValidator() {
  const formElementRef = useRef(null);
  const [isValid, setValid] = useState(true);
  const [customValid, setCustomValid] = useState(true);

  const revalidate = (cv = customValid) => {
    // Has to adjusted after every Resource Form structure change
    const formContainer = formElementRef.current?.querySelector(
      '.resource-form ui5-form-item',
    ).children[0];
    if (formContainer) {
      setValid(cv && validateFormElement(formContainer, true).valid);
    }
  };
  console.log(isValid);
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
