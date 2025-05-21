import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Create, ResourceDescription } from 'components/KymaModules';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ModulesList } from './components/ModulesList';
import { KymaModuleContext } from './providers/KymaModuleProvider';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { CommunityModulesList } from './components/CommunityModulesList';

export default function KymaModulesList({ namespaced }) {
  const { t } = useTranslation();

  const {
    resourceName,
    resourceUrl,
    kymaResource,
    kymaResourceLoading,
    selectedKymaModules,
    moduleTemplates,
    moduleTemplatesLoading,
    setOpenedModuleIndex,
    handleResourceDelete,
  } = useContext(KymaModuleContext);
  const { isProtected, protectedResourceWarning } = useProtectedResources();

  const {
    managed: managedModuleTemplates,
    unmanaged: communityModuleTemplates,
  } = useMemo(() => {
    if (!moduleTemplates?.items) return { managed: [], unmanaged: [] };

    const managed = { items: [] };
    const unmanaged = { items: [] };

    moduleTemplates.items.forEach(item => {
      if (item.metadata?.labels?.['operator.kyma-project.io/managed-by']) {
        managed.items.push(item);
      } else {
        unmanaged.items.push(item);
      }
    });

    return { managed, unmanaged };
  }, [moduleTemplates]);

  if (moduleTemplatesLoading || kymaResourceLoading) {
    return <Spinner />;
  }

  return (
    <DynamicPageComponent
      className="kyma-modules"
      showYamlTab={false}
      layoutNumber="startColumn"
      title={t('kyma-modules.title')}
      description={ResourceDescription}
      content={
        <>
          {kymaResource && (
            <ModulesList
              key="kyma-modules-list"
              resource={kymaResource}
              moduleTemplates={managedModuleTemplates}
              resourceName={resourceName}
              selectedModules={selectedKymaModules}
              kymaResource={kymaResource}
              namespaced={namespaced}
              resourceUrl={resourceUrl}
              setOpenedModuleIndex={setOpenedModuleIndex}
              handleResourceDelete={handleResourceDelete}
            />
          )}
          {kymaResource && (
            <CommunityModulesList
              key="kyma-community-modules-list"
              moduleTemplates={communityModuleTemplates}
              //selectedModules={[{ name: 'cluster-ip-029' }, { name: 'cluster-ip-1' }]}
              namespaced={namespaced}
              setOpenedModuleIndex={setOpenedModuleIndex}
              handleResourceDelete={handleResourceDelete}
            />
          )}
        </>
      }
      inlineEditForm={() => (
        <ResourceCreate
          isEdit={true}
          confirmText={t('common.buttons.save')}
          protectedResource={isProtected(kymaResource)}
          protectedResourceWarning={protectedResourceWarning(
            kymaResource,
            true,
          )}
          renderForm={props => (
            <ErrorBoundary>
              <Create
                resource={kymaResource}
                resourceUrl={resourceUrl}
                {...props}
              />
            </ErrorBoundary>
          )}
        />
      )}
    />
  );
}
