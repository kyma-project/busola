import pluralize from 'pluralize';

export const getExtensibilityPath = ({
  resource: { kind },
}: {
  resource: { kind: string };
}) => pluralize((kind ?? '').toLowerCase());
