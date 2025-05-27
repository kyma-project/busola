import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import { Button } from '@ui5/webcomponents-react';
import pluralize from 'pluralize';
import {
  findModuleTemplate,
  ModuleTemplateListType,
  ModuleTemplateType,
} from '../support';
import { useUrl } from 'hooks/useUrl';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import {
  columnLayoutState,
  ColumnState,
  ShowCreate,
} from 'state/columnLayoutAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useNavigate } from 'react-router';
import { useFetchModuleData } from '../hooks';
import { ModulesListRows } from './ModulesListRows';

type ModulesListProps = {
  moduleTemplates: ModuleTemplateListType;
  selectedModules: any[];
  modulesLoading: boolean;
  namespaced: boolean;
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
  namespaced,
  setOpenedModuleIndex,
  handleResourceDelete,
  customSelectedEntry,
  setSelectedEntry,
}: ModulesListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clusterUrl, namespaceUrl } = useUrl();
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const { getItem: getModuleResource } = useFetchModuleData(
    moduleTemplates,
    (module: ModuleTemplateType) => module?.spec?.data ?? null,
    'resource',
  );

  const handleShowAddModule = () => {
    setLayoutColumn({
      startColumn: {
        resourceType: 'kymamodules',
      } as ColumnState,
      midColumn: null,
      endColumn: null,
      layout: 'TwoColumnsMidExpanded',
      showCreate: {
        resourceType: 'kymamodules',
      } as ShowCreate,
    });

    navigate(
      `${window.location.pathname}?layout=TwoColumnsMidExpanded&showCreate=true`,
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

  const handleClickResource = (
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

    const skipRedirect = !hasDetailsLink(moduleStatus);

    if (skipRedirect) {
      return;
    }

    const pathName = `${pluralize(
      moduleStatus?.resource?.kind || '',
    ).toLowerCase()}/${moduleStatus?.resource?.metadata?.name}`;

    const partialPath = moduleStatus?.resource?.metadata?.namespace
      ? `kymamodules/namespaces/${moduleStatus?.resource?.metadata?.namespace}/${pathName}`
      : `kymamodules/${pathName}`;

    const path = namespaced
      ? namespaceUrl(partialPath)
      : clusterUrl(partialPath);

    const { group, version } = extractApiGroupVersion(
      moduleStatus?.resource?.apiVersion,
    );
    setLayoutColumn({
      startColumn: {
        resourceType: pluralize(
          moduleStatus?.resource?.kind || '',
        ).toLowerCase(),
        namespaceId: moduleStatus?.resource?.metadata.namespace || '',
        apiGroup: group,
        apiVersion: version,
      } as ColumnState,
      midColumn: {
        resourceType: pluralize(
          moduleStatus?.resource?.kind || '',
        ).toLowerCase(),
        resourceName: moduleStatus?.resource?.metadata?.name,
        namespaceId: moduleStatus?.resource?.metadata.namespace || '',
        apiGroup: group,
        apiVersion: version,
      } as ColumnState,
      layout: 'TwoColumnsMidExpanded',
      endColumn: null,
    });

    navigate(`${path}?layout=TwoColumnsMidExpanded`);
  };

  return (
    <React.Fragment key="commmunity-modules-list">
      <GenericList
        accessibleName={undefined}
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
              'kyma-modules.title',
            ).toLocaleLowerCase()}`,
            subtitleText: t('kyma-modules.no-modules-description'),
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
