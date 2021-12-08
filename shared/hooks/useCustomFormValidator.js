import { useState, useRef, useEffect } from 'react';

export function useCustomFormValidator() {
  const formElementRef = useRef(null);
  const [isValid, setValid] = useState(false);
  const [customValid, setCustomValid] = useState(true);

  const revalidate = (cv = customValid) => {
    const formValid = formElementRef?.current?.checkValidity() ?? false;
    setValid(cv && formValid);
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
