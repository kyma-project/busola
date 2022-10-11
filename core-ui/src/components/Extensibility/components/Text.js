import { useGetPlaceholder } from 'components/Extensibility/helpers';
import { isNil } from 'lodash';
import { stringifyIfBoolean } from 'shared/utils/helpers';

export const Text = ({ value, schema, structure }) => {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  const sanitizedValue = stringifyIfBoolean(value);
  return isNil(value) ? emptyLeafPlaceholder : sanitizedValue;
};
Text.inline = true;
Text.copyable = true;
