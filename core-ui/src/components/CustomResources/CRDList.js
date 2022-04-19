import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';
import { GroupingListPage } from './GroupingListPage';

export default function CRDList() {
  const { t } = useTranslation();

  const navigateToCrdDetails = crd =>
    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate('/customresourcedefinitions/details/' + crd.metadata.name);

  const description = (
    <Trans i18nKey="custom-resource-definitions.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/"
      />
    </Trans>
  );

  return (
    <GroupingListPage
      title={t('custom-resource-definitions.title')}
      description={description}
      resourceListProps={{ navigateFn: navigateToCrdDetails }}
      showCrdScope
    />
  );
}
