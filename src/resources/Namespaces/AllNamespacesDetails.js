import { useTranslation } from 'react-i18next';

import { prettifyNamePlural } from 'shared/utils/helpers';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { useUrl } from 'hooks/useUrl';

import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';

import { spacing } from '@ui5/webcomponents-react-base';

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
      <DynamicPageComponent
        title={t('navigation.all-namespaces')}
        breadcrumbItems={breadcrumbItems}
        content={
          <div className="flexwrap" style={{ ...spacing.sapUiMediumMargin }}>
            <ResourcesUsage />
            <NamespaceWorkloads />
          </div>
        }
      />
    </>
  );
}
