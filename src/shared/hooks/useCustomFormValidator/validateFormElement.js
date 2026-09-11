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
  let isPartiallyFilled = false; // tracks if at least one child has been filled out (important for the validation of non-required FormGroups)
  let isComplete = true; // tracks if all children have been filled out (important for the validation of non-required GenericLists)
  console.log(element.children);
  console.log(isRequired, isValid);
  for (const child of element?.children || []) {
    console.log(child);
    console.log(isRequired, isValid);
    if (isRequired && !isValid) break;

    isRequired = false;

    let validationFunction, args;
    switch (true) {
      // Validates the CollapsibleSection (GenericList/ResourceForm) by recursively calling this function
      case child.classList.contains('resource-form__collapsible-section'): {
        console.log('here??');
        // Finds the children's container and checks if it is required
        const required = child.classList.contains('required');
        const content = child.querySelector('div.content');
        const contentWrapper = child.querySelector(
          'div.content > .form-group__grid-wrapper',
        );
        const contentParent =
          contentWrapper?.parentNode === content ? contentWrapper : content;

        const { valid, filled, complete } = validateFormElement(
          contentParent,
          required,
        );
        // GenericList
        if (child.querySelector('.actions')?.innerText === 'Add') {
          isPartiallyFilled = isPartiallyFilled || filled;
          isComplete = isComplete && complete;
          isValid = isValid && valid;
        }
        // ResourceForm
        else {
          isPartiallyFilled = isPartiallyFilled || filled;
          isComplete = isComplete && (complete || (valid && filled));
          isValid = isValid && valid;
        }
        console.log(isRequired, isValid);

        continue;
      }
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
      // Validates the FormField
      case child.classList.contains('form-field'):
        validationFunction = validateFormField;
        args = [child];
        break;
      default:
        continue;
    }
    const { valid, filled, required } = validationFunction(...args);
    isValid = isValid && valid;
    isPartiallyFilled = isPartiallyFilled || filled;
    isComplete = isComplete && filled;
    console.log('isRequired before: ' + isRequired, 'reqiured: ' + required);
    isRequired = required || isRequired;

    console.log(element);
    console.log('child classlist:' + child.classList);
    console.log('isValid:' + isValid, 'isRequired:' + isRequired);
  }
  console.log(isValid);
  return {
    valid: isValid || (!isRequired && !isPartiallyFilled),
    filled: isPartiallyFilled || isComplete,
    complete: isComplete,
  };
}
