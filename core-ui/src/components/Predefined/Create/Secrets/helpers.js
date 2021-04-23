import { base64Encode } from 'shared/helpers';

export const mapObjectValues = (fn, obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );

export const createSecretInput = (
  { name, namespace, labels, annotations, data, type },
  isEncoded,
) => {
  return {
    metadata: {
      name,
      namespace,
      labels,
      annotations,
    },
    data: isEncoded ? data : mapObjectValues(base64Encode, data),
    type,
  };
};
