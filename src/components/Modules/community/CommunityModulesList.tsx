import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import {
  getModuleName,
  ModuleTemplateListType,
} from 'components/Modules/support';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ModulesListRows } from 'components/Modules/components/ModulesListRows';
import {
  CommunityModulesInstallationContext,
  moduleInstallationState,
} from 'components/Modules/community/providers/CommunitModulesInstalationProvider';
import { State } from 'components/Modules/community/components/uploadStateAtom';
import { UpdateModuleButton } from '../components/moduleUpdate/UpdateModuleButton';
import { getUpdateTemplate } from './communityModulesHelpers';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';
import { useModuleNavigation } from 'components/Modules/hooks/useModuleNavigation';
import { useModuleCrdsAndExtensions } from 'components/Modules/hooks/useModuleCrdsAndExtensions';
import { useShowAddModule } from 'components/Modules/hooks/useShowAddModule';

type CommunityModulesListProps = {
  moduleTemplates: ModuleTemplateListType;
  selectedModules: any[];
  modulesLoading: boolean;
  namespaced: boolean;
  resourceUrl: string;
  setOpenedModuleIndex: React.Dispatch<React.SetStateAction<number | null>>;
  handleResourceDelete: (resourceData: any) => void;
  customSelectedEntry?: string;
  setSelectedEntry?: React.Dispatch<React.SetStateAction<any>>;
};

// This function create fake module templates which is treated as installed to show progress of module upload
function createFakeModuleTemplateWithStatus(
  moduleState: moduleInstallationState,
) {
  return {
    name: getModuleName(moduleState.moduleTpl),
    namespace: moduleState.moduleTpl.metadata.namespace,
    moduleTemplateName: moduleState.moduleTpl.metadata.name,
    version: moduleState.moduleTpl.spec.version,
    fakeStatus: {
      type: moduleState.state,
      state: moduleState.state,
      message: moduleState.message,
    },
  };
}

export const CommunityModulesList = ({
  moduleTemplates,
  selectedModules: installedModules,
  modulesLoading,
  namespaced,
  resourceUrl,
  setOpenedModuleIndex,
  handleResourceDelete,
  customSelectedEntry,
  setSelectedEntry,
}: CommunityModulesListProps) => {
  const { t } = useTranslation();
  const { preloadedCommunityTemplates } = useContext(ModuleTemplatesContext);

  const { extensions, crds } = useModuleCrdsAndExtensions('community', [
    installedModules,
  ]);

  const { handleClickResource, hasDetailsLink, customColumnLayout } =
    useModuleNavigation({
      moduleTemplates,
      extensions,
      crds,
      namespaced,
      installedModules,
      setOpenedModuleIndex,
      setSelectedEntry,
    });

  const handleShowAddModule = useShowAddModule(resourceUrl, 'community');

  const { modulesDuringUpload } = useContext(
    CommunityModulesInstallationContext,
  );

  // When multiple instances of the same module templates exist in different namespaces, we want to display only one instance of the module
  function dedupeByModuleManager(modules: any[]) {
    const seen = new Set<string>();

    return modules.filter((module) => {
      const { name: managerName, namespace: managerNamespace } =
        module?.resource?.metadata || {};

      if (!managerName || !managerNamespace) return true;

      const key = `${module?.name}::${module?.version}::${managerName}::${managerNamespace}`;

      return seen.has(key) ? false : seen.add(key);
    });
  }

  const modulesToDisplay = useMemo(() => {
    const uniqueInstalled = dedupeByModuleManager(installedModules);

    const modulesDuringProcessing = modulesDuringUpload.filter((m) => {
      return !uniqueInstalled.find(
        (installed) =>
          installed.moduleTemplateName === m.moduleTpl.metadata.name,
      );
    });

    if (modulesDuringProcessing.length === 0) {
      return uniqueInstalled;
    }

    const moduleTemplatesDuringUpload = modulesDuringProcessing
      .filter((m) => m.state !== State.Finished)
      .map((m) => createFakeModuleTemplateWithStatus(m));

    return [...uniqueInstalled, ...moduleTemplatesDuringUpload];
  }, [installedModules, modulesDuringUpload]);

  const headerRenderer = () => [
    t('common.headers.name'),
    t('kyma-modules.namespaces'),
    t('kyma-modules.channel'),
    t('kyma-modules.version'),
    t('kyma-modules.module-state'),
    t('kyma-modules.installation-state'),
    t('kyma-modules.documentation'),
  ];

  const actions = [
    ...[
      {
        name: 'update',
        component: (entry: any) => {
          const repoTpl = getUpdateTemplate(
            entry.name,
            preloadedCommunityTemplates,
            installedModules,
          );
          const installedModule = installedModules.find(
            (m) => m.name === entry.name,
          );
          if (!repoTpl || !installedModule) return null;
          return (
            <UpdateModuleButton
              moduleName={entry.name}
              currentVersion={installedModule.version}
              newVersion={repoTpl.spec.version}
              moduleTpl={repoTpl}
            />
          );
        },
      },
    ],
    {
      name: t('common.buttons.delete'),
      tooltip: () => t('common.buttons.delete'),
      icon: 'delete',
      disabledHandler: (resource: { name: string }) => {
        const index = installedModules?.findIndex((module) => {
          return module.name === resource.name;
        });
        return index < 0;
      },
      handler: (resource: { name: string }) => {
        const index = installedModules?.findIndex((module) => {
          return module.name === resource.name;
        });
        setOpenedModuleIndex(index);
        handleResourceDelete({});
      },
    },
  ];

  return (
    <React.Fragment key="commmunity-modules-list">
      <GenericList
        testid={'community-modules-list'}
        className={'community-modules-list'}
        actions={actions as any}
        customRowClick={handleClickResource}
        extraHeaderContent={[
          <Button key="add-community-module" onClick={handleShowAddModule}>
            {t('common.buttons.add')}
          </Button>,
        ]}
        customColumnLayout={customColumnLayout as any}
        enableColumnLayout
        hasDetailsView
        entries={modulesToDisplay as any}
        serverDataLoading={modulesLoading}
        headerRenderer={headerRenderer}
        rowRenderer={(resource) =>
          ModulesListRows({
            resourceName: resource.name,
            resource,
            moduleTemplates,
            hasDetailsLink,
            newestModuleTemplate: getUpdateTemplate(
              resource.name,
              preloadedCommunityTemplates,
              installedModules,
            ),
          })
        }
        disableHiding={false}
        displayArrow
        hasRowDetails={hasDetailsLink}
        title={t('modules.community.installed-modules')}
        sortBy={{
          name: (a: { name: any }, b: { name: any }) =>
            a.name?.localeCompare(b.name),
        }}
        emptyListProps={
          {
            image: 'TntComponents',
            titleText: `${t('common.labels.no')} ${t(
              'modules.community.title',
            ).toLocaleLowerCase()}`,
            subtitleText: t('modules.community.no-modules-description'),
            url: 'https://kyma-project.io/#/community-modules/user/README',
            buttonText: t('common.buttons.add'),
            showButton: true,
            onClick: handleShowAddModule,
          } as any
        }
        customSelectedEntry={customSelectedEntry}
      />
    </React.Fragment>
  );
};
