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

    // When formContainer doesn't exist, the form is a single element
    // Then go with the default form validation
    if (formContainer) {
      setValid(cv && validateElement(formContainer, true).valid);
    } else {
      const formValid = formElementRef?.current?.checkValidity() ?? false;
      setValid(cv && formValid);
    }
  };

  // Recursively validates all of the element's required children
  // Only validates non-required children, if they are at least partially filled out
  function validateElement(element, isRequired) {
    let isValid =
      !isRequired ||
      element?.children.length > 0 ||
      (!isRequired && element?.children.length === 0);
    let isPartiallyFilled = false; // tracks if at least one child has been filled out, important for the validation of non-required FormGroups
    let isComplete = true; // tracks if all children have been filled out, important for the validation of non-required GenericLists

    for (const child of element?.children) {
      if (isRequired && !isValid) break;

      if (child.classList.contains('form-field')) {
        // Validates the KeyValuePair
        if (child.classList.contains('multi-input')) {
          const { valid, filled } = validateInputList(child, isRequired);
          isValid = isValid && valid;
          isPartiallyFilled = isPartiallyFilled || filled;
          isComplete = isComplete && filled;
        }
        // Validates the FormField
        else {
          const { valid, filled } = validateFormField(child);
          isValid = isValid && valid;
          isPartiallyFilled = isPartiallyFilled || filled;
          isComplete = isComplete && filled;
        }
      }
      // Validates the SimpleList
      else if (child.classList.contains('simple-list')) {
        const { valid, filled } = validateInputList(child, isRequired);
        isValid = isValid && valid;
        isPartiallyFilled = isPartiallyFilled || filled;
        isComplete = isComplete && filled;
      }
      //Validates the CollapsibleSection
      else if (child.classList.contains('resource-form__collapsible-section')) {
        // Finds the children's container and checks if it's required
        let contentParent = child.querySelector('div.content');
        if (
          contentParent.firstChild?.classList.contains(
            'collapsible-renderer__grid-wrapper',
          )
        ) {
          contentParent = contentParent.firstChild;
        }
        const required = child.classList.contains('required');
        // Validates the GenericList
        if (child.querySelector('.actions').innerText === 'Add') {
          const { valid, filled, complete } = validateElement(
            contentParent,
            required,
          );
          //isValid = isValid && valid && (filled || contentParent.children.length === 0);
          isPartiallyFilled = isPartiallyFilled || filled;
          isComplete = isComplete && complete;
          isValid = isValid && valid && complete;
        }
        // Validates the ResourceForm
        else {
          const { valid, filled, complete } = validateElement(
            contentParent,
            required,
          );
          isPartiallyFilled = isPartiallyFilled || filled;
          isComplete = isComplete && (complete || (valid && filled));
          isValid = isValid && valid;
        }
      }
    }
    return {
      valid: isValid || (!isRequired && !isPartiallyFilled),
      filled: isPartiallyFilled || isComplete,
      complete: isComplete,
    };
  }

  // Validates the FormField's input
  function validateFormField(formField) {
    // Input: Extensibility = 'input', otherwise = #select-dropdown
    const input = formField.querySelector('input');
    const isValid = input
      ? input.checkValidity()
      : formField.querySelector('#select-dropdown')?.value !== '';
    return { valid: isValid, filled: input?.value !== '' };
  }

  function validateInputList(inputList, isRequired) {
    // The list is invalid if it has no children
    const items = inputList.querySelectorAll('ul > li');
    if (isRequired && items.length < 2) return { valid: false, filled: false };

    // Validates the inputs of all the list's child elements
    const inputs = inputList.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].checkValidity())
        return { valid: false, filled: items.length >= 2 };
    }
    return { valid: true, filled: items.length >= 2 };
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
