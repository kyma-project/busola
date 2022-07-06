import { useGetPlaceholder } from 'components/Extensibility/helpers';

export const Text = ({ value, schema, structure }) => {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value || emptyLeafPlaceholder;
};
Text.inline = true;
