import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExternalLink } from 'shared/components/Link/ExternalLink';

import { DestinationRuleCreate } from './DestinationRuleCreate';

export function DestinationRuleList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('destination-rules.host'),
      value: rule => rule.spec.host,
    },
  ];

  const description = (
    <Trans i18nKey="destination-rules.description">
      <ExternalLink
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/networking/destination-rule/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      resourceName={t('destination-rules.title')}
      customColumns={customColumns}
      description={description}
      createResourceForm={DestinationRuleCreate}
      {...props}
    />
  );
}

export default DestinationRuleList;
