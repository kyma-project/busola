import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import pluralize from 'pluralize';
import {
  createModulePartialPath,
  DEFAULT_K8S_NAMESPACE,
  findCrd,
  findExtension,
  findModuleTemplate,
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

type CommunityModulesListProps = {
  moduleTemplates: ModuleTemplateListType;
  selectedModules: any[];
  modulesLoading: boolean;
  resourceUrl: string;
  setOpenedModuleIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  handleResourceDelete: (resourceData: any) => void;
  customSelectedEntry?: string;
  setSelectedEntry?: React.Dispatch<React.SetStateAction<any>>;
};

export const CommunityModulesList = ({
  moduleTemplates,
  selectedModules: installedModules,
  modulesLoading,
  resourceUrl,
  setOpenedModuleIndex,
  handleResourceDelete,
  customSelectedEntry,
  setSelectedEntry,
}: CommunityModulesListProps) => {
  const { t } = useTranslation();

  const { data: communityExtentions } = useGetList(
    (ext: { metadata: { labels: Record<string, string> } }) =>
      ext.metadata.labels['app.kubernetes.io/part-of'] !== 'Kyma',
  )('/api/v1/configmaps?labelSelector=busola.io/extension=resource', {
    pollingInterval: 5000,
  } as any);

  const { data: crds } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`,
    {
      pollingInterval: 5000,
    } as any,
  );

  const navigate = useNavigate();
  const { clusterUrl } = useUrl();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const setIsFormOpen = useSetAtom(isFormOpenAtom);
  const { getItem: getModuleResource } = useFetchModuleData(
    moduleTemplates,
    (module: ModuleTemplateType) => module?.spec?.data ?? null,
    'resource',
    modulesLoading,
  );
  const getScope = useGetScope();

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
    setIsFormOpen(state => ({ ...state, formOpen: true }));
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
    resource: { kind: string };
  }) => {
    const moduleTemplateName = findModuleTemplate(
      moduleTemplates,
      resource.name,
      resource.channel,
      resource.version,
    )?.metadata?.name;
    const moduleResource = getModuleResource(moduleTemplateName ?? '');

    const moduleStatus = moduleResource?.status;
    const isDeletionFailed = moduleStatus?.state === 'Warning';
    const isError = moduleStatus?.state === 'Error';

    const hasResource = !!moduleResource;

    return hasResource && (!isDeletionFailed || !isError);
  };

  const customColumnLayout = (resource: { name: string }) => {
    const moduleResource = getModuleResource(resource.name);

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
        const index = installedModules?.findIndex(module => {
          return module.name === resource.name;
        });
        return index < 0;
      },
      handler: (resource: { name: string }) => {
        const index = installedModules?.findIndex(module => {
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
      resource: {
        kind: string;
        apiVersion: string;
        metadata: { name: string; namespace: string };
      };
    },
  ) => {
    setOpenedModuleIndex(
      installedModules?.findIndex(entry => entry.name === moduleName),
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
        kind: moduleResource.kind,
        apiVersion: moduleResource.apiVersion,
        metadata: {
          name: moduleResource.metadata.name,
          namespace: moduleResource.metadata.namespace,
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
    const isNamespaced = await getScope(
      group,
      version,
      moduleStatus?.resource?.kind,
    );

    const partialPath = createModulePartialPath(
      hasExtension,
      moduleStatus.resource,
      moduleCrd,
      isNamespaced,
    );

    const path = clusterUrl(partialPath);

    setLayoutColumn(prev => ({
      startColumn: prev.startColumn,
      midColumn: {
        resourceType: hasExtension
          ? pluralize(moduleStatus?.resource?.kind || '').toLowerCase()
          : moduleCrd?.metadata?.name,
        resourceName: moduleStatus?.resource?.metadata?.name,
        namespaceId: isNamespaced
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
        entries={installedModules as any}
        serverDataLoading={modulesLoading}
        headerRenderer={headerRenderer}
        rowRenderer={resource =>
          ModulesListRows({
            resourceName: resource.name,
            resource,
            moduleTemplates,
            hasDetailsLink,
          })
        }
        noHideFields={['Name', '', 'Namespace']}
        displayArrow
        title={'Community Modules'}
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
            url:
              'https://help.sap.com/docs/btp/sap-business-technology-platform/kyma-s-modular-approach?locale=en-US&state=DRAFT&version=Cloud',
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
