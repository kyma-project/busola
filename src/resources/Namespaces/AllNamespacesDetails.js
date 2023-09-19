import React from 'react';
import { useTranslation } from 'react-i18next';

import { prettifyNamePlural } from 'shared/utils/helpers';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { useUrl } from 'hooks/useUrl';

import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';

import './NamespaceDetails.scss';

export function AllNamespacesDetails(props) {
  const { t } = useTranslation();
  const { resourceListUrl } = useUrl();

  const breadcrumbItems = props.breadcrumbs || [
    {
      name: prettifyNamePlural(props.resourceTitle, props.resourceType),
      url: resourceListUrl({}, { resourceType: props.resourceType }),
    },
    { name: '' },
  ];

  return (
    <>
      <PageHeader
        title={t('navigation.all-namespaces')}
        breadcrumbItems={breadcrumbItems}
        content={
          <div className="panel-grid">
            <NamespaceWorkloads />
            <ResourcesUsage />
          </div>
        }
      />
    </>
  );
}
