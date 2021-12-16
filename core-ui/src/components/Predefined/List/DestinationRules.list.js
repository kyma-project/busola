import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const DestinationRulesList = ({ DefaultRenderer, ...otherParams }) => {
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
    <DefaultRenderer
      resourceName={t('destination-rules.title')}
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
