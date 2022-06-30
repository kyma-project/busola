import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export const Text = ({ value, schema, structure }) => {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  } else if (!value && structure.placeholder) {
    return structure.placeholder;
  } else if (!value) {
    return EMPTY_TEXT_PLACEHOLDER;
  } else {
    return value;
  }
};
Text.inline = true;
