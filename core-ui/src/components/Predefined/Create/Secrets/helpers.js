export const mapObjectValues = (fn, obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );

export const createSecretInput = (
  { name, namespace, labels, annotations, data, type },
  isEncoded,
) => ({
  metadata: {
    name,
    namespace,
    labels,
    annotations,
  },
  data: isEncoded ? data : mapObjectValues(btoa, data),
  type,
});
