import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export const Text = ({ value, schema, structure, resource }) => {
  const { defaultPlaceholder } = resource || {};

  if (typeof value === 'object') {
    return JSON.stringify(value);
  } else if (!value && structure.placeholder) {
    return structure.placeholder;
  } else if (!value && defaultPlaceholder) {
    return defaultPlaceholder;
  } else if (!value) {
    return EMPTY_TEXT_PLACEHOLDER;
  } else {
    return value;
  }
};
Text.inline = true;
