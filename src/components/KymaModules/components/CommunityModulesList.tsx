import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import jsyaml from 'js-yaml';
import { Button } from '@ui5/webcomponents-react';
import pluralize from 'pluralize';
import {
  findModuleTemplate,
  ModuleTemplateListType,
  useGetInstalledModules,
} from '../support';
import { useUrl } from 'hooks/useUrl';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import {
  columnLayoutState,
  ColumnState,
  ShowCreate,
} from 'state/columnLayoutAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { useGet, useGetList } from 'shared/hooks/BackendAPI/useGet';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useNavigate } from 'react-router';
import { CommunityModulesListRows } from './CommunityModulesListRows';

type CustomResourceDefinitionsType = {
  items: {
    metadata?: { name: string };
    spec?: { names?: { kind?: string } };
  }[];
};

type ModulesListProps = {
  moduleTemplates: ModuleTemplateListType;
  selectedModules: { name: string }[];
  namespaced: boolean;
  setOpenedModuleIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  handleResourceDelete: (resourceData: any) => void;
};

export const CommunityModulesList = ({
  moduleTemplates,
  // selectedModules,
  namespaced,
  setOpenedModuleIndex,
  handleResourceDelete,
}: ModulesListProps) => {
  const { t } = useTranslation();
  const { data: crds } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`,
    {
      pollingInterval: 5000,
    } as any,
  );

  const navigate = useNavigate();
  const { clusterUrl, namespaceUrl } = useUrl();
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const {
    installed,
    loading: installedModulesLoading,
    error,
  } = useGetInstalledModules(moduleTemplates);

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

  const hasDetailsLink = (
    resource: {
      name: string;
      channel: string;
      version: string;
      resource: { kind: string };
    },
    moduleStatus,
  ) => {
    const isDeletionFailed = moduleStatus?.state === 'Warning';
    const isError = moduleStatus?.state === 'Error';

    // let hasModuleTpl = !!findModuleTemplate(
    //   moduleTemplates,
    //   resource.name,
    //   resource.channel,
    //   resource.version,
    // );
    // TODO: hasResource???
    return isDeletionFailed || !isError;
  };

  const customColumnLayout = (resource: { name: string }) => {
    return {
      resourceName: resource?.name,
      resourceType: pluralize(resource.name?.kind || ''),
      namespaceId: resource?.metadata?.namespace || '',
    };
  };

  const actions = [
    {
      name: t('common.buttons.delete'),
      tooltip: () => t('common.buttons.delete'),
      icon: 'delete',
      disabledHandler: (resource: { name: string }) => {
        const index = moduleTemplates?.items?.findIndex(module => {
          return module.metadata.name === resource.name;
        });
        return index < 0;
      },
      handler: (resource: { name: string }) => {
        const index = moduleTemplates?.items?.findIndex(module => {
          return module.metadata.name === resource.name;
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
      moduleTemplates?.items?.findIndex(entry => entry.name === moduleName),
    );

    // It can be refactored after implementing https://github.com/kyma-project/lifecycle-manager/issues/2232
    if (!moduleStatus.resource) {
      const connectedModule = findModuleTemplate(
        moduleTemplates,
        moduleName,
        moduleStatus.channel,
        moduleStatus.version,
      );
      const moduleCr = connectedModule?.spec?.data;
      moduleStatus.resource = {
        kind: moduleCr.kind,
        apiVersion: moduleCr.apiVersion,
        metadata: {
          name: moduleCr.metadata.name,
          namespace: moduleCr.metadata.namespace,
        },
      };
    }

    const skipRedirect = !hasDetailsLink(moduleStatus, null); //TODO

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
    <React.Fragment key="modules-list">
      <GenericList
        accessibleName={undefined}
        actions={actions as any}
        customRowClick={handleClickResource}
        extraHeaderContent={[
          <Button
            key="add-module"
            design="Emphasized"
            onClick={handleShowAddModule}
          >
            {t('common.buttons.add')}
          </Button>,
        ]}
        customColumnLayout={customColumnLayout as any}
        enableColumnLayout
        hasDetailsView
        entries={installed ?? []}
        headerRenderer={headerRenderer}
        rowRenderer={resource =>
          CommunityModulesListRows({
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
      />
    </React.Fragment>
  );
};
