import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import jsyaml from 'js-yaml';
import { Button } from '@ui5/webcomponents-react';
import pluralize from 'pluralize';
import {
  findModuleStatus,
  findModuleTemplate,
  KymaResourceSpecModuleType,
  KymaResourceStatusModuleType,
  KymaResourceType,
  ModuleTemplateListType,
} from '../support';
import { UnmanagedModuleInfo } from './UnmanagedModuleInfo';
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
import { ModulesListRows } from './ModulesListRows';
import { useNavigate } from 'react-router-dom';

type CustomResourceDefinitionsType = {
  items: {
    metadata?: { name: string };
    spec?: { names?: { kind?: string } };
  }[];
};

type ModulesListProps = {
  resource: KymaResourceType;
  moduleTemplates: ModuleTemplateListType;
  resourceName: string;
  selectedModules: { name: string }[];
  kymaResource: KymaResourceType;
  namespaced: boolean;
  resourceUrl: string;
  setOpenedModuleIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  handleResourceDelete: (resourceData: any) => void;
};

export const ModulesList = ({
  resource,
  moduleTemplates,
  resourceName,
  selectedModules,
  kymaResource,
  namespaced,
  resourceUrl,
  setOpenedModuleIndex,
  handleResourceDelete,
}: ModulesListProps) => {
  const { t } = useTranslation();
  const { data: kymaExt } = useGetList(
    (ext: { metadata: { labels: Record<string, string> } }) =>
      ext.metadata.labels['app.kubernetes.io/part-of'] === 'Kyma',
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
  const { clusterUrl, namespaceUrl } = useUrl();
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);

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
        resourceUrl: resourceUrl,
      } as ShowCreate,
    });

    navigate(
      `${window.location.pathname}?layout=TwoColumnsMidExpanded&showCreate=true`,
    );
    setIsFormOpen(state => ({ ...state, formOpen: true }));
  };

  const findExtension = (resourceKind: string) => {
    return (kymaExt as { data: { general: string } }[] | null)?.find(ext => {
      const { resource: extensionResource } =
        jsyaml.load(ext.data.general, { json: true }) || ({} as any);
      return extensionResource.kind === resourceKind;
    });
  };

  const findCrd = (resourceKind: string) => {
    return (crds as CustomResourceDefinitionsType | null)?.items?.find(
      crd => crd.spec?.names?.kind === resourceKind,
    );
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
    const isInstalled =
      selectedModules?.findIndex(kymaResourceModule => {
        return kymaResourceModule?.name === resource?.name;
      }) >= 0;
    const moduleStatus = findModuleStatus(kymaResource, resource.name);
    const isDeletionFailed = moduleStatus?.state === 'Warning';
    const isError = moduleStatus?.state === 'Error';

    const hasExtension = !!findExtension(resource?.resource?.kind);
    const hasCrd = !!findCrd(resource?.resource?.kind);

    let hasModuleTpl = !!findModuleTemplate(
      moduleTemplates,
      resource.name,
      resource.channel,
      resource.version,
    );
    return (
      (isInstalled || isDeletionFailed || !isError) &&
      (hasCrd || hasExtension || hasModuleTpl)
    );
  };

  const customColumnLayout = (resource: { name: string }) => {
    return {
      resourceName: resource?.name,
      resourceType: pluralize(
        findModuleStatus(kymaResource, resource.name)?.resource?.kind || '',
      ),
      namespaceId:
        findModuleStatus(kymaResource, resource.name)?.resource?.metadata
          ?.namespace || '',
    };
  };

  const actions = [
    {
      name: t('common.buttons.delete'),
      tooltip: () => t('common.buttons.delete'),
      icon: 'delete',
      disabledHandler: (resource: { name: string }) => {
        const index = selectedModules?.findIndex(kymaResourceModule => {
          return kymaResourceModule.name === resource.name;
        });
        return index < 0;
      },
      handler: (resource: { name: string }) => {
        const index = selectedModules?.findIndex(kymaResourceModule => {
          return kymaResourceModule.name === resource.name;
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
      selectedModules.findIndex(entry => entry.name === moduleName),
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

    const hasExtension = !!findExtension(moduleStatus?.resource?.kind);
    const moduleCrd = findCrd(moduleStatus?.resource?.kind);
    const skipRedirect = !hasDetailsLink(moduleStatus);

    if (skipRedirect) {
      return;
    }

    const pathName = `${
      hasExtension
        ? `${pluralize(moduleStatus?.resource?.kind || '').toLowerCase()}/${
            moduleStatus?.resource?.metadata?.name
          }`
        : `${moduleCrd?.metadata?.name}/${moduleStatus?.resource?.metadata?.name}`
    }`;

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
        resourceType: hasExtension
          ? pluralize(moduleStatus?.resource?.kind || '').toLowerCase()
          : moduleCrd?.metadata?.name,
        namespaceId: moduleStatus?.resource?.metadata.namespace || '',
        apiGroup: group,
        apiVersion: version,
      } as ColumnState,
      midColumn: {
        resourceType: hasExtension
          ? pluralize(moduleStatus?.resource?.kind || '').toLowerCase()
          : moduleCrd?.metadata?.name,
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

  function getEntries(
    statusModules: KymaResourceStatusModuleType[] = [],
    specModules: KymaResourceSpecModuleType[] = [],
  ) {
    specModules.forEach(specItem => {
      const exists = statusModules.some(
        statusItem => statusItem?.name === specItem?.name,
      );

      if (!exists) {
        statusModules.push({ name: specItem.name });
      }
    });
    return statusModules;
  }

  return (
    <React.Fragment key="modules-list">
      <div className="sap-margin-small">
        <UnmanagedModuleInfo kymaResource={kymaResource} />
      </div>
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
        entries={
          getEntries(resource?.status?.modules, resource?.spec?.modules) as any
        }
        headerRenderer={headerRenderer}
        rowRenderer={resource =>
          ModulesListRows({
            resourceName,
            resource,
            kymaResource,
            moduleTemplates,
            hasDetailsLink,
          })
        }
        noHideFields={['Name', '', 'Namespace']}
        displayArrow
        title={'Modules'}
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
