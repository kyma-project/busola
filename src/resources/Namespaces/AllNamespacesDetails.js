import { useTranslation } from 'react-i18next';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';
import { spacing } from '@ui5/webcomponents-react-base';

export function AllNamespacesDetails() {
  const { t } = useTranslation();

  return (
    <>
      <DynamicPageComponent
        title={t('navigation.all-namespaces')}
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
