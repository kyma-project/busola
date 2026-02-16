import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Create, ResourceDescription } from 'components/Modules';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { KymaModulesList } from 'components/Modules/components/KymaModulesList';
import { KymaModuleContext } from './providers/KymaModuleProvider';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { CommunityModulesList } from 'components/Modules/community/CommunityModulesList';
import { CommunityModuleContext } from 'components/Modules/community/providers/CommunityModuleProvider';
import { ModuleTemplatesContext } from './providers/ModuleTemplatesProvider';
import { checkSelectedModule } from './support';
import { useAtomValue } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';
import { CommunityModulesDeleteBoxContext } from 'components/Modules/community/components/CommunityModulesDeleteBox';
import { ProtectedResourceWarning } from 'shared/components/ProtectedResourcesButton';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';

export default function ModulesList({ namespaced }) {
  const { t } = useTranslation();
  useWindowTitle(t('kyma-modules.title'));

  const layoutState = useAtomValue(columnLayoutAtom);
  const { isEnabled: isCommunityModulesEnabled } = useFeature(
    configFeaturesNames.COMMUNITY_MODULES,
  );

  const {
    resourceName,
    resourceUrl,
    kymaResource,
    kymaResourceLoading,
    selectedModules,
    moduleTemplatesLoading,
    setOpenedModuleIndex: setOpenedManagedModuleIndex,
    handleResourceDelete,
  } = useContext(KymaModuleContext);
  const { moduleTemplates, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );
  const { installedCommunityModules, installedCommunityModulesLoading } =
    useContext(CommunityModuleContext);

  const {
    setOpenedModuleIndex: setOpenedCommunityModuleIndex,
    handleResourceDelete: handleCommunityModuleDelete,
  } = useContext(CommunityModulesDeleteBoxContext);

  const [selectedEntry, setSelectedEntry] = useState(null);
  const { isProtected, isProtectedResource } = useProtectedResources();

  useEffect(() => {
    if (
      !installedCommunityModulesLoading &&
      installedCommunityModules?.length
    ) {
      const timeoutId = setTimeout(() => {
        setSelectedEntry(
          installedCommunityModules.find((moduleTemplate) =>
            checkSelectedModule(moduleTemplate, layoutState),
          )?.name,
        );
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [
    installedCommunityModulesLoading,
    installedCommunityModules,
    layoutState,
  ]);

  if (moduleTemplatesLoading || kymaResourceLoading) {
    return <Spinner />;
  }

  // Use isProtectedResource for showing the icon (always show if resource matches rules)
  const showProtectedResourceWarning = isProtectedResource(kymaResource);
  // Use isProtected for blocking modifications (considers user setting)
  const isResourceProtected = isProtected(kymaResource);

  return (
    <DynamicPageComponent
      className="kyma-modules"
      showYamlTab={false}
      layoutNumber="startColumn"
      title={t('kyma-modules.title')}
      description={ResourceDescription}
      isFirstColumnWithEdit={true}
      content={
        <>
          {kymaResource && (
            <KymaModulesList
              key="kyma-modules-list"
              resource={kymaResource}
              moduleTemplates={moduleTemplates}
              resourceName={resourceName}
              selectedModules={selectedModules}
              kymaResource={kymaResource}
              namespaced={namespaced}
              resourceUrl={resourceUrl}
              protectedResource={showProtectedResourceWarning}
              setOpenedModuleIndex={setOpenedManagedModuleIndex}
              handleResourceDelete={handleResourceDelete}
              customSelectedEntry={selectedEntry}
              setSelectedEntry={setSelectedEntry}
            />
          )}
          {isCommunityModulesEnabled && (
            <CommunityModulesList
              key="community-modules-list"
              moduleTemplates={communityModuleTemplates}
              selectedModules={installedCommunityModules}
              modulesLoading={installedCommunityModulesLoading}
              namespaced={namespaced}
              setOpenedModuleIndex={setOpenedCommunityModuleIndex}
              handleResourceDelete={handleCommunityModuleDelete}
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
          protectedResource={showProtectedResourceWarning}
          protectedResourceWarning={
            <ProtectedResourceWarning entry={kymaResource} withText />
          }
          isProtectedResourceModificationBlocked={isResourceProtected}
          renderForm={(props) => (
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
