import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { Trans, useTranslation } from 'react-i18next';
import { PageHeader, Link } from 'react-shared';
import { FormInput } from 'fundamental-react';
import { useWindowTitle } from 'react-shared/hooks';
import { GroupingList } from './GroupingList';

export default function CRDList() {
  const { t } = useTranslation();
  useWindowTitle(t('custom-resource-definitions.title'));

  const [searchQuery, setSearchQuery] = useState('');

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

  const header = (
    <PageHeader
      title={t('custom-resource-definitions.title')}
      description={description}
      actions={
        <FormInput
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="fd-margin-begin--lg this-will-be-removed-later"
          type="search"
        />
      }
    />
  );

  return (
    <>
      {header}
      <GroupingList
        a
        searchQuery={searchQuery}
        resourceListProps={{ navigateFn: navigateToCrdDetails }}
      />
    </>
  );
}
