import { useState, useRef } from 'react';

export function useCustomFormValidator() {
  const formElementRef = useRef(null);
  const [isValid, setValid] = useState(false);
  const [customValid, setCustomValid] = useState(true);

  const revalidate = (cv = customValid) => {
    // FormContainer: Extensibility = 'div.form-container', otherwise = .firstChild
    const formContainer =
      formElementRef.current.querySelector('div.form-container') ??
      formElementRef.current.firstChild;
    setValid(cv && validateElement(formContainer));
  };

  // Recursively validates all of the element's children
  function validateElement(element) {
    let isValid = element.children.length > 0;

    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];

      if (child.classList.contains('form-field')) {
        // Validates the KeyValuePair
        if (child.classList.contains('multi-input')) {
          isValid = isValid && validateInputList(child);
        }
        // Validates the FormField
        else {
          isValid = isValid && validateFormField(child);
        }
      }
      // Validates the SimpleList
      else if (child.classList.contains('simple-list')) {
        isValid = isValid && validateInputList(child);
      }
      // Validates the ResourceForm
      else if (child.classList.contains('resource-form__collapsible-section')) {
        // Finds the children's container
        let contentParent = child.querySelector('div.content');
        if (
          contentParent.firstChild?.classList.contains(
            'collapsible-renderer__grid-wrapper',
          )
        ) {
          contentParent = contentParent.firstChild;
        }
        // Validates the resourceForm's children if it is required
        if (child.classList.contains('required')) {
          isValid = isValid && validateElement(contentParent);
        }
      }
    }

    return isValid;
  }

  // Validates the FormField's input
  function validateFormField(formField) {
    const input = formField.querySelector('input');
    return input.checkValidity();
  }

  function validateInputList(inputList) {
    // The list is invalid if it has no children
    const items = inputList.querySelectorAll('ul > li');
    if (items.length < 2) return false;

    // Validates the inputs of all the list's child elements
    const inputs = inputList.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].checkValidity()) return false;
    }
    return true;
  }

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
