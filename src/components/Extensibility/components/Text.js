import {
  useGetPlaceholder,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { isNil } from 'lodash';
import { stringifyIfBoolean } from 'shared/utils/helpers';

export const Text = ({ value, schema, structure }) => {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const { t: tExt } = useGetTranslation();

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  const sanitizedValue = stringifyIfBoolean(value);
  return isNil(value) ? emptyLeafPlaceholder : tExt(sanitizedValue);
};
Text.inline = true;
Text.copyable = true;
