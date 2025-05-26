import { useContext, useState } from 'react';
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
import { splitModuleTemplates } from './support';

export default function KymaModulesList({ namespaced }) {
  const { t } = useTranslation();
  const [selectedEntry, setSelectedEntry] = useState(null);

  const {
    resourceName,
    resourceUrl,
    kymaResource,
    kymaResourceLoading,
    selectedModules,
    moduleTemplates,
    moduleTemplatesLoading,
    setOpenedModuleIndex,
    handleResourceDelete,
    installedCommunityModules,
    communityModulesLoading,
  } = useContext(KymaModuleContext);
  const { isProtected, protectedResourceWarning } = useProtectedResources();

  const {
    managed: managedModuleTemplates,
    unmanaged: communityModuleTemplates,
  } = splitModuleTemplates(moduleTemplates);

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
              selectedModules={selectedModules}
              kymaResource={kymaResource}
              namespaced={namespaced}
              resourceUrl={resourceUrl}
              setOpenedModuleIndex={setOpenedModuleIndex}
              handleResourceDelete={handleResourceDelete}
              customSelectedEntry={selectedEntry}
              setSelectedEntry={setSelectedEntry}
            />
          )}
          {kymaResource && (
            <CommunityModulesList
              key="kyma-community-modules-list"
              moduleTemplates={communityModuleTemplates}
              selectedModules={installedCommunityModules}
              modulesLoading={communityModulesLoading}
              namespaced={namespaced}
              setOpenedModuleIndex={setOpenedModuleIndex}
              handleResourceDelete={handleResourceDelete}
              customSelectedEntry={selectedEntry}
              setSelectedEntry={setSelectedEntry}
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
