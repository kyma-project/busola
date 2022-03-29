import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link, ResourcesList } from 'react-shared';

import { DestinationRulesCreate } from '../Create/DestinationRules/DestinationRules.create';

const DestinationRulesList = props => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('destination-rules.host'),
      value: rule => rule.spec.host,
    },
  ];

  const description = (
    <Trans i18nKey="destination-rules.description">
      <Link
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
      createResourceForm={DestinationRulesCreate}
      {...props}
    />
  );
};

export default DestinationRulesList;
