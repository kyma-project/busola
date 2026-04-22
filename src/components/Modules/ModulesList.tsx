import { RefObject, useContext, useMemo, useState } from 'react';
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
import { useAtomValue } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';
import { useUrl } from 'hooks/useUrl';
import { configFeaturesNames } from 'state/types';
import { CommunityModulesDeleteBoxContext } from 'components/Modules/community/components/CommunityModulesDeleteBox';
import { ProtectedResourceWarning } from 'shared/components/ProtectedResourcesButton';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';

export default function ModulesList({ namespaced }: { namespaced: boolean }) {
  const { t } = useTranslation();
  useWindowTitle(t('kyma-modules.title'));

  const layoutState = useAtomValue(columnLayoutAtom);
  const { clusterUrl, namespaceUrl } = useUrl();
  const modulesListUrl = namespaced
    ? namespaceUrl('kymamodules')
    : clusterUrl('kymamodules');
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

  const [selectedKymaEntry, setSelectedKymaEntry] = useState<
    string | undefined
  >(undefined);
  const [selectedCommunityEntry, setSelectedCommunityEntry] = useState<
    string | undefined
  >(undefined);
  const { isProtected, isProtectedResource } = useProtectedResources();

  // Match on full CR identity — modules can share a kind, so matching on
  // kind alone would cross-highlight unrelated rows.
  const midColumn = layoutState?.midColumn;
  const matchesLayout = (m: any) =>
    m?.resource?.kind === midColumn?.rawResourceTypeName &&
    m?.resource?.metadata?.name === midColumn?.resourceName &&
    (m?.resource?.metadata?.namespace ?? '') === (midColumn?.namespaceId ?? '');

  const matchesTemplateData = (t: any) =>
    t?.spec?.data?.kind === midColumn?.rawResourceTypeName &&
    t?.spec?.data?.metadata?.name === midColumn?.resourceName;
  const templateModuleName = (items?: any[]) =>
    items?.find(matchesTemplateData)?.metadata?.labels?.[
      'operator.kyma-project.io/module-name'
    ];
  const layoutMatchedKyma = midColumn?.rawResourceTypeName
    ? (kymaResource?.status?.modules?.find(matchesLayout)?.name ??
      templateModuleName(moduleTemplates?.items))
    : undefined;
  const layoutMatchedCommunity = midColumn?.rawResourceTypeName
    ? installedCommunityModules?.find(matchesLayout)?.name
    : undefined;

  const isDetailsOpen = !!layoutState?.midColumn;
  const displayedKymaEntry = isDetailsOpen
    ? (layoutMatchedKyma ?? selectedKymaEntry)
    : undefined;
  const displayedCommunityEntry = isDetailsOpen
    ? (layoutMatchedCommunity ?? selectedCommunityEntry)
    : undefined;

  const filteredCommunityModules = useMemo(() => {
    if (!installedCommunityModules?.length) return [];
    const selectedModulesNames = selectedModules.map(
      (module: { name: string }) => module.name,
    );
    return installedCommunityModules.filter(
      (module) => !selectedModulesNames.includes(module.name),
    );
  }, [installedCommunityModules, selectedModules]);

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
      layoutCloseUrl={modulesListUrl}
      content={
        <>
          {kymaResource && (
            <KymaModulesList
              key="kyma-modules-list"
              resource={kymaResource}
              moduleTemplates={moduleTemplates}
              resourceName={resourceName ?? ''}
              selectedModules={selectedModules}
              kymaResource={kymaResource}
              namespaced={namespaced}
              resourceUrl={resourceUrl ?? ''}
              protectedResource={showProtectedResourceWarning}
              setOpenedModuleIndex={setOpenedManagedModuleIndex}
              handleResourceDelete={handleResourceDelete}
              customSelectedEntry={displayedKymaEntry}
              setSelectedEntry={(name) => {
                setSelectedKymaEntry(name);
                setSelectedCommunityEntry(undefined);
              }}
            />
          )}
          {isCommunityModulesEnabled && (
            <CommunityModulesList
              key="community-modules-list"
              resourceUrl={resourceUrl ?? ''}
              moduleTemplates={communityModuleTemplates}
              selectedModules={filteredCommunityModules}
              modulesLoading={installedCommunityModulesLoading}
              namespaced={namespaced}
              setOpenedModuleIndex={setOpenedCommunityModuleIndex}
              handleResourceDelete={handleCommunityModuleDelete}
              customSelectedEntry={displayedCommunityEntry}
              setSelectedEntry={(name) => {
                setSelectedCommunityEntry(name);
                setSelectedKymaEntry(undefined);
              }}
            />
          )}
        </>
      }
      inlineEditForm={() => (
        <ResourceCreate
          isEdit={true}
          title=""
          confirmText={t('common.buttons.save')}
          protectedResource={showProtectedResourceWarning}
          protectedResourceWarning={
            <ProtectedResourceWarning entry={kymaResource} withText />
          }
          isProtectedResourceModificationBlocked={isResourceProtected}
          renderForm={({ formElementRef, ...props }) => (
            <ErrorBoundary>
              <Create
                {...props}
                resource={kymaResource}
                resourceUrl={resourceUrl ?? ''}
                formElementRef={formElementRef as RefObject<HTMLFormElement>}
              />
            </ErrorBoundary>
          )}
        />
      )}
    />
  );
}
