import pluralize from 'pluralize';

export const getExtensibilityPath = ({
  urlPath,
  resource,
}: {
  urlPath?: string | undefined;
  resource?: { kind?: string | undefined };
} = {}) => urlPath ?? pluralize((resource?.kind ?? '').toLowerCase());
