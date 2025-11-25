import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import pluralize from 'pluralize';
import {
  createModulePartialPath,
  DEFAULT_K8S_NAMESPACE,
  findCrd,
  findExtension,
  findModuleTemplate,
  getModuleName,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/Modules/support';
import { useUrl } from 'hooks/useUrl';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import {
  columnLayoutAtom,
  ColumnState,
  ShowCreate,
} from 'state/columnLayoutAtom';
import { useSetAtom } from 'jotai';
import { isFormOpenAtom } from 'state/formOpenAtom';
import {
  useGet,
  useGetList,
  useGetScope,
} from 'shared/hooks/BackendAPI/useGet';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useNavigate } from 'react-router';
import { useFetchModuleData } from 'components/Modules/hooks';
import { ModulesListRows } from 'components/Modules/components/ModulesListRows';
import {
  CommunityModulesInstallationContext,
  moduleInstallationState,
} from 'components/Modules/community/providers/CommunitModulesInstalationProvider';
import { State } from 'components/Modules/community/components/uploadStateAtom';

type CommunityModulesListProps = {
  moduleTemplates: ModuleTemplateListType;
  selectedModules: any[];
  modulesLoading: boolean;
  namespaced: boolean;
  resourceUrl: string;
  setOpenedModuleIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
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

  const { data: communityExtentions, silentRefetch: getCommunityExtentions } =
    useGetList(
      (ext: { metadata: { labels: Record<string, string> } }) =>
        ext.metadata.labels['app.kubernetes.io/part-of'] !== 'Kyma',
    )('/api/v1/configmaps?labelSelector=busola.io/extension=resource', {
      pollingInterval: 0,
    } as any);

  const { data: crds, silentRefetch: getCrds } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`,
    {
      pollingInterval: 0,
    } as any,
  );
  useEffect(() => {
    getCommunityExtentions();
    getCrds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installedModules]);

  const navigate = useNavigate();
  const { clusterUrl, namespaceUrl } = useUrl();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const setIsFormOpen = useSetAtom(isFormOpenAtom);
  const { getItem: getModuleResource } = useFetchModuleData(
    moduleTemplates,
    (module: ModuleTemplateType) => module?.spec?.data ?? null,
    'resource',
    modulesLoading,
  );
  const getScope = useGetScope();

  const { modulesDuringUpload } = useContext(
    CommunityModulesInstallationContext,
  );

  const [modulesToDisplay, setModulesToDisplay] =
    useState<any[]>(installedModules);

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

  useEffect(() => {
    const uniqueInstalled = dedupeByModuleManager(installedModules);

    const modulesDuringProcessing = modulesDuringUpload.filter((m) => {
      return !uniqueInstalled.find(
        (installed) =>
          installed.moduleTemplateName === m.moduleTpl.metadata.name,
      );
    });

    if (modulesDuringProcessing.length === 0) {
      setModulesToDisplay(uniqueInstalled);
      return;
    }

    const moduleTemplatesDuringUpload = modulesDuringProcessing
      .filter((m) => m.state !== State.Finished)
      .map((m) => createFakeModuleTemplateWithStatus(m));

    setModulesToDisplay([...uniqueInstalled, ...moduleTemplatesDuringUpload]);
  }, [installedModules, modulesDuringUpload]);

  const handleShowAddModule = () => {
    setLayoutColumn({
      startColumn: {
        resourceType: 'kymas',
        rawResourceTypeName: 'Kyma',
        namespaceId: 'kyma-system',
        apiGroup: 'operator.kyma-project.io',
        apiVersion: 'v1beta2',
      } as ColumnState,
      midColumn: null,
      endColumn: null,
      layout: 'TwoColumnsMidExpanded',
      showCreate: {
        resourceType: 'kymas',
        rawResourceTypeName: 'Kyma',
        createType: 'community',
        resourceUrl: resourceUrl,
      } as ShowCreate,
    });

    navigate(
      `${window.location.pathname}?layout=TwoColumnsMidExpanded&showCreate=true&createType=community`,
    );
    setIsFormOpen((state) => ({ ...state, formOpen: true }));
  };

  const headerRenderer = () => [
    t('common.headers.name'),
    t('kyma-modules.namespaces'),
    t('kyma-modules.channel'),
    t('kyma-modules.version'),
    t('kyma-modules.module-state'),
    t('kyma-modules.installation-state'),
    t('kyma-modules.documentation'),
  ];

  const hasDetailsLink = (resource: {
    name: string;
    channel: string;
    version: string;
    namespace?: string;
    resource: { kind: string; metadata: { namespace: string } };
  }) => {
    const currentModuleTemplate = findModuleTemplate(
      moduleTemplates,
      resource.name,
      resource.channel,
      resource.version,
      resource.namespace,
    );

    const moduleResource = getModuleResource(
      currentModuleTemplate?.metadata?.name ?? '',
      currentModuleTemplate?.spec?.manager?.namespace ?? '',
    );

    const moduleStatus = moduleResource?.status;
    const isDeletionFailed = moduleStatus?.state === 'Warning';
    const isError = moduleStatus?.state === 'Error';

    const hasResource = !!moduleResource;

    const hasExtension = !!findExtension(
      resource?.resource?.kind,
      communityExtentions,
    );
    const moduleCrd = findCrd(resource?.resource?.kind, crds);

    return (
      hasResource &&
      (!isDeletionFailed || !isError) &&
      (hasExtension || !!moduleCrd)
    );
  };

  const customColumnLayout = (resource: {
    name: string;
    namespace: string;
  }) => {
    const moduleResource = getModuleResource(resource.name, resource.namespace);

    return {
      resourceName: resource?.name,
      resourceType: pluralize(moduleResource?.kind || ''),
      namespaceId: moduleResource?.metadata?.namespace || '',
    };
  };

  const actions = [
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

  const handleClickResource = async (
    moduleName: string,
    moduleStatus: {
      name: string;
      channel: string;
      version: string;
      namespace: string;
      resource: {
        kind: string;
        apiVersion: string;
        metadata: { name: string; namespace: string };
      };
    },
  ) => {
    setOpenedModuleIndex(
      installedModules?.findIndex((entry) => entry.name === moduleName),
    );

    setSelectedEntry?.(moduleName);

    const moduleTemplate = findModuleTemplate(
      moduleTemplates,
      moduleName,
      moduleStatus.channel,
      moduleStatus.version,
    );
    if (!moduleStatus.resource) {
      const moduleResource = moduleTemplate?.spec?.data;
      moduleStatus.resource = {
        kind: moduleResource?.kind ?? '',
        apiVersion: moduleResource?.apiVersion ?? '',
        metadata: {
          name: moduleResource?.metadata?.name ?? '',
          namespace: moduleResource?.metadata?.namespace ?? '',
        },
      };
    }

    const hasExtension = !!findExtension(
      moduleStatus?.resource?.kind,
      communityExtentions,
    );
    const moduleCrd = findCrd(moduleStatus?.resource?.kind, crds);
    const skipRedirect = !hasDetailsLink(moduleStatus);

    if (skipRedirect) {
      return;
    }

    const { group, version } = extractApiGroupVersion(
      moduleStatus?.resource?.apiVersion,
    );
    const moduleIsNamespaced = await getScope(
      group,
      version,
      moduleStatus?.resource?.kind,
    );

    const partialPath = createModulePartialPath(
      hasExtension,
      moduleStatus.resource,
      moduleCrd,
      moduleIsNamespaced,
    );

    const path = namespaced
      ? namespaceUrl(partialPath)
      : clusterUrl(partialPath);

    setLayoutColumn((prev) => ({
      startColumn: prev.startColumn,
      midColumn: {
        resourceType: hasExtension
          ? pluralize(moduleStatus?.resource?.kind || '').toLowerCase()
          : moduleCrd?.metadata?.name,
        resourceName: moduleStatus?.resource?.metadata?.name,
        namespaceId: moduleIsNamespaced
          ? moduleStatus?.resource?.metadata.namespace || DEFAULT_K8S_NAMESPACE
          : '',
        apiGroup: group,
        apiVersion: version,
      } as ColumnState,
      layout: 'TwoColumnsMidExpanded',
      endColumn: null,
    }));

    navigate(`${path}?layout=TwoColumnsMidExpanded`);
  };

  return (
    <React.Fragment key="commmunity-modules-list">
      <GenericList
        testid={'community-modules-list'}
        className={'community-modules-list'}
        actions={actions as any}
        customRowClick={handleClickResource}
        extraHeaderContent={[
          <Button
            key="add-community-module"
            design="Emphasized"
            onClick={handleShowAddModule}
          >
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
          })
        }
        disableHiding={false}
        displayArrow
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
        namespaceColIndex={1}
      />
    </React.Fragment>
  );
};
