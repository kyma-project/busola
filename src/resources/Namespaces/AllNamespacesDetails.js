import { useTranslation } from 'react-i18next';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';
import { spacing } from '@ui5/webcomponents-react-base';
import { Title } from '@ui5/webcomponents-react';

export function AllNamespacesDetails() {
  const { t } = useTranslation();

  return (
    <>
      <DynamicPageComponent
        title={t('navigation.all-namespaces')}
        content={
          <>
            <Title
              level="H3"
              style={{
                ...spacing.sapUiMediumMarginBegin,
                ...spacing.sapUiMediumMarginTopBottom,
              }}
            >
              {t('common.headers.monitoring-and-health')}
            </Title>
            <div className="cluster-stats" style={spacing.sapUiTinyMargin}>
              <ResourcesUsage />
              <NamespaceWorkloads />
            </div>
          </>
        }
      />
    </>
  );
}
