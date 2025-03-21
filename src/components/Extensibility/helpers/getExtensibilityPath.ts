import pluralize from 'pluralize';

export const getExtensibilityPath = ({
  urlPath,
  resource: { kind },
}: {
  urlPath?: string | undefined;
  resource: { kind: string };
}) => urlPath ?? pluralize((kind ?? '').toLowerCase());
