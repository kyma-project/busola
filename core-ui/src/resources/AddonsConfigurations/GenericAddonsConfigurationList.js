import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { ExternalLink } from 'shared/components/Link/ExternalLink';

export function GenericAddonsConfigurationList({
  descriptionKey,
  documentationLink,
  ...props
}) {
  const { t, i18n } = useTranslation();

  const statusColumn = {
    header: t('common.headers.status'),
    value: addon => (
      <ResourceStatus status={addon.status} resourceKind="addons" i18n={i18n} />
    ),
  };

  const description = (
    <Trans i18nKey={descriptionKey}>
      <ExternalLink className="fd-link" url={documentationLink} />
    </Trans>
  );

  const customColumns = [statusColumn];
  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      {...props}
    />
  );
}
