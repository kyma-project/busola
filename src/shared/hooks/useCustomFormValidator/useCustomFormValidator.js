import { useState, useRef } from 'react';
import { validateFormElement } from './validateFormElement';

export function useCustomFormValidator() {
  const formElementRef = useRef(null);
  const [isValid, setValid] = useState(true);
  const [customValid, setCustomValid] = useState(true);

  const revalidate = (cv = customValid) => {
    let formContainer =
      formElementRef.current?.querySelector('div.simple-form') ??
      formElementRef.current?.querySelector('div.advanced-form') ??
      formElementRef.current?.querySelector('div.yaml-form') ??
      formElementRef.current;
    if (formContainer) {
      setValid(cv && validateFormElement(formContainer, true).valid);
    }
  };

  return {
    isValid,
    formElementRef,
    setCustomValid: val => {
      setCustomValid(val);
      revalidate(val);
    },
    revalidate,
  };
}
