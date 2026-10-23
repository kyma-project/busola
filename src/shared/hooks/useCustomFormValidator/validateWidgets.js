// Validates the FormField's input
export function validateFormField(formField) {
  const input =
    formField.querySelector('ui5-input') ??
    formField.querySelector('ui5-combobox') ??
    formField.querySelector('ui5-switch');

  const required = input?.required;

  if (input?.tagName?.toLowerCase() === 'ui5-switch') {
    return { valid: true, filled: true, required };
  }

  const pattern = input?.getAttribute('pattern');
  const value = input?.value;

  const isEmpty = required && (value === '' || value === 'NaN');
  const isPatternMismatch = !isEmpty && pattern && !value.match(pattern);
  const isValid = !isEmpty && !isPatternMismatch;

  const label = formField.querySelector('ui5-label')?.textContent?.trim();
  const reason = isEmpty ? 'empty' : isPatternMismatch ? 'pattern' : undefined;
  return {
    valid: isValid,
    filled: value !== '' && value !== 'NaN',
    required,
    label,
    reason,
  };
}

export function validateMultiCheckboxes(formField, isRequired) {
  const checkboxes = Array.from(formField.querySelectorAll('ui5-checkbox'));
  const isFilled = checkboxes.some((checkbox) => checkbox.checked);
  const label = formField.querySelector('ui5-label')?.textContent?.trim();

  return {
    valid: !isRequired || isFilled,
    filled: isFilled,
    label,
    reason: 'empty',
  };
}

export function validateInputList(list, isRequired) {
  const items = list.querySelectorAll('ul > li');
  // The list is invalid if it has no children
  if (isRequired && items.length < 2) return { valid: false, filled: false };
  // Validates the inputs of all the list's child elements
  const inputs = Array.from(list.querySelectorAll('ui5-input')).slice(0, -1);
  const isValid = inputs.every((input) => {
    const pattern = input.getAttribute('pattern');
    const value = input.value;
    return value !== '' && (!pattern || value.match(pattern));
  });

  return { valid: isValid, filled: items.length >= 2 };
}

export function validateKeyValuePairs(list, isRequired) {
  const items = list.querySelectorAll('ul > li');
  // The list is invalid if it has no children
  if (isRequired && items.length < 2) return { valid: false, filled: false };
  // Validates the inputs (except for the last two placeholder inputs)
  const inputs = Array.from(list.querySelectorAll('ui5-input')).slice(0, -2);
  const isValid = inputs.every((input) => {
    const isKey = input.getAttribute('placeholder') === 'Enter key';
    const pattern = input.getAttribute('pattern');
    const value = input.value;
    return (!isKey || value !== '') && (!pattern || value.match(pattern));
  });

  return { valid: isValid, filled: items.length >= 2 };
}

export function validateRuntimeProfile(parent) {
  const inputs = Array.from(parent.querySelectorAll('ui5-input'));
  const isValid = inputs.every((input) => {
    const isRequired = input.required;
    const inputValue = input.value;
    return inputValue !== 'NaN' && (!isRequired || inputValue !== '');
  });

  return { valid: isValid, filled: true };
}
