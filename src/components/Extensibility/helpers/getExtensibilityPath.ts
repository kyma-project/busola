import pluralize from 'pluralize';

export const getExtensibilityPath = ({
  urlPath,
  resource: { kind },
}: {
  urlPath?: string;
  resource: { kind: string };
}) => urlPath || pluralize((kind ?? '').toLowerCase());
