import {
  validateFormField,
  validateInputList,
  validateKeyValuePairs,
  validateMultiCheckboxes,
  validateRuntimeProfile,
} from './validateWidgets';

// Recursively validates all of the element's required children
export function validateFormElement(element, isRequired) {
  let isValid =
    !isRequired ||
    element?.children.length > 0 ||
    (!isRequired && element?.children.length === 0);
  let isPartiallyFilled = false; // tracks if at least one child has been filled out, important for the validation of non-required FormGroups
  let isComplete = true; // tracks if all children have been filled out, important for the validation of non-required GenericLists

  for (const child of element?.children) {
    if (isRequired && !isValid) break;

    let validationFunction, args;
    switch (true) {
      case child.classList.contains('form-field'):
        switch (true) {
          // Validates the KeyValuePair
          case child.classList.contains('multi-input'):
            validationFunction = validateKeyValuePairs;
            args = [child, isRequired];
            break;
          // Validates the MultiCheckboxes
          case child.classList.contains('multi-checkbox'):
            validationFunction = validateMultiCheckboxes;
            args = [child, isRequired];
            break;
          // Validates the FormField
          default:
            validationFunction = validateFormField;
            args = [child];
        }
        break;
      // Validates the SimpleList
      case child.classList.contains('simple-list'):
        validationFunction = validateInputList;
        args = [child, isRequired];
        break;
      // Validates the RuntimeProfile
      case child.classList.contains('runtime-profile-form'):
        validationFunction = validateRuntimeProfile;
        args = [child];
        break;
      // Validates the CollapsibleSection
      case child.classList.contains('resource-form__collapsible-section'):
        // Finds the children's container and checks if it is required
        const gridWrapper = child.querySelector(
          'div.content > .collapsible-renderer__grid-wrapper',
        );
        const contentParent = gridWrapper || child.querySelector('div.content');
        const required = child.classList.contains('required');
        // Validates the GenericList
        if (child.querySelector('.actions').innerText === 'Add') {
          const { valid, filled, complete } = validateFormElement(
            contentParent,
            required,
          );
          isPartiallyFilled = isPartiallyFilled || filled;
          isComplete = isComplete && complete;
          isValid = isValid && valid && complete;
          continue;
        }
        // Validates the ResourceForm
        else {
          const { valid, filled, complete } = validateFormElement(
            contentParent,
            required,
          );
          isPartiallyFilled = isPartiallyFilled || filled;
          isComplete = isComplete && (complete || (valid && filled));
          isValid = isValid && valid;
          continue;
        }
      default:
        break;
    }
    const { valid, filled } = validationFunction(...args);
    isValid = isValid && valid;
    isPartiallyFilled = isPartiallyFilled || filled;
    isComplete = isComplete && filled;
  }

  return {
    valid: isValid || (!isRequired && !isPartiallyFilled),
    filled: isPartiallyFilled || isComplete,
    complete: isComplete,
  };
}
