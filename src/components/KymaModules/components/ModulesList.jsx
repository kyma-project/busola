import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import jsyaml from 'js-yaml';
import { Button, Tag, Text } from '@ui5/webcomponents-react';
import pluralize from 'pluralize';
import { findModuleStatus, findModuleTemplate } from '../support';
import { UnmanagedModuleInfo } from './UnmanagedModuleInfo';
import { ModuleStatus, resolveType } from './ModuleStatus';
import { ModulesListDeleteBox } from './ModulesListDeleteBox';
import { useModulesReleaseQuery } from '../kymaModulesQueries';
import { useUrl } from 'hooks/useUrl';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useGet, useGetList } from 'shared/hooks/BackendAPI/useGet';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

export const ModulesList = ({
  DeleteMessageBox,
  handleResourceDelete,
  resource,
  moduleTemplates,
  resourceName,
  selectedModules,
  kymaResource,
  namespaced,
  detailsOpen,
  resourceUrl,
  kymaResourceState,
  setOpenedModuleIndex,
  setKymaResourceState,
  handleModuleUninstall,
  setInitialUnchangedResource,
}) => {
  const { t } = useTranslation();
  const { data: moduleReleaseMetas } = useModulesReleaseQuery({
    skip: !resourceName,
  });
  const { data: kymaExt } = useGetList(
    ext => ext.metadata.labels['app.kubernetes.io/part-of'] === 'Kyma',
  )('/api/v1/configmaps?labelSelector=busola.io/extension=resource', {
    pollingInterval: 5000,
  });
  const { data: crds } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`,
    {
      pollingInterval: 5000,
    },
  );

  const { clusterUrl, namespaceUrl } = useUrl();
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const [chosenModuleIndex, setChosenModuleIndex] = useState(null);

  const handleShowAddModule = () => {
    setLayoutColumn({
      startColumn: {
        resourceType: 'kymamodules',
      },
      midColumn: null,
      endColumn: null,
      layout: 'TwoColumnsMidExpanded',
      showCreate: {
        resourceType: 'kymamodules',
        resourceUrl: resourceUrl,
      },
    });

    setIsFormOpen({ formOpen: true });
  };

  const findModuleReleaseMeta = moduleName => {
    return moduleReleaseMetas?.items.find(
      item => item.spec.moduleName === moduleName,
    );
  };

  const findExtension = resourceKind => {
    return kymaExt?.find(ext => {
      const { resource: extensionResource } =
        jsyaml.load(ext.data.general, { json: true }) || {};
      return extensionResource.kind === resourceKind;
    });
  };

  const checkBeta = (module, currentModuleReleaseMeta) => {
    return (
      module?.metadata.labels['operator.kyma-project.io/beta'] === 'true' ||
      currentModuleReleaseMeta?.spec?.beta === true
    );
  };

  const findCrd = resourceKind => {
    return crds?.items?.find(crd => crd.spec?.names?.kind === resourceKind);
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

  const hasDetailsLink = resource => {
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

  const rowRenderer = resource => {
    const moduleStatus = findModuleStatus(kymaResource, resource.name);
    const showDetailsLink = hasDetailsLink(resource);
    const moduleIndex = kymaResource?.spec?.modules?.findIndex(
      kymaResourceModule => {
        return kymaResourceModule?.name === resource?.name;
      },
    );

    const currentModuleTemplate = findModuleTemplate(
      moduleTemplates,
      resource?.name,
      resource?.channel || kymaResource?.spec?.channel,
      resource?.version,
    );

    const moduleDocs =
      currentModuleTemplate?.spec?.info?.documentation ||
      currentModuleTemplate?.metadata?.annotations[
        'operator.kyma-project.io/doc-url'
      ];

    const currentModuleReleaseMeta = findModuleReleaseMeta(resource.name);

    const isChannelOverriden =
      kymaResource?.spec?.modules?.[moduleIndex]?.channel !== undefined;

    return [
      // Name
      <>
        {showDetailsLink ? (
          <Text style={{ fontWeight: 'bold', color: 'var(--sapLinkColor)' }}>
            {resource.name}
          </Text>
        ) : (
          resource.name
        )}
        {checkBeta(currentModuleTemplate, currentModuleReleaseMeta) ? (
          <Tag
            className="sap-margin-begin-tiny"
            hideStateIcon
            colorScheme="3"
            design="Set2"
          >
            {t('kyma-modules.beta')}
          </Tag>
        ) : null}
      </>,
      // Namespace
      moduleStatus?.resource?.metadata?.namespace || EMPTY_TEXT_PLACEHOLDER,
      // Channel
      <>
        {moduleStatus?.channel
          ? moduleStatus?.channel
          : kymaResource?.spec?.modules?.[moduleIndex]?.channel ||
            kymaResource?.spec?.channel}
        {isChannelOverriden ? (
          <Tag
            hideStateIcon
            design="Set2"
            colorScheme="5"
            className="sap-margin-begin-tiny"
          >
            {t('kyma-modules.channel-overridden')}
          </Tag>
        ) : (
          ''
        )}
      </>,
      // Version
      moduleStatus?.version || EMPTY_TEXT_PLACEHOLDER,
      // Module State
      <ModuleStatus key="module-state" resource={resource} />,
      // Installation State
      <StatusBadge
        key="installation-state"
        resourceKind="kymas"
        type={resolveType(moduleStatus?.state)}
        tooltipContent={moduleStatus?.message}
      >
        {moduleStatus?.state || 'Unknown'}
      </StatusBadge>,
      // Documentation
      moduleDocs ? (
        <ExternalLink url={moduleDocs}>{t('common.headers.link')}</ExternalLink>
      ) : (
        EMPTY_TEXT_PLACEHOLDER
      ),
    ];
  };

  const customColumnLayout = resource => {
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
      disabledHandler: resource => {
        const index = selectedModules?.findIndex(kymaResourceModule => {
          return kymaResourceModule.name === resource.name;
        });
        return index < 0;
      },
      handler: resource => {
        const index = selectedModules?.findIndex(kymaResourceModule => {
          return kymaResourceModule.name === resource.name;
        });
        setChosenModuleIndex(index);
        handleResourceDelete({});
      },
    },
  ];

  const handleClickResource = (moduleName, moduleStatus) => {
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
      const moduleCr = connectedModule.spec.data;
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
      },
      midColumn: {
        resourceType: hasExtension
          ? pluralize(moduleStatus?.resource?.kind || '').toLowerCase()
          : moduleCrd?.metadata?.name,
        resourceName: moduleStatus?.resource?.metadata?.name,
        namespaceId: moduleStatus?.resource?.metadata.namespace || '',
        apiGroup: group,
        apiVersion: version,
      },
      layout: 'TwoColumnsMidExpanded',
      endColumn: null,
    });

    window.history.pushState(
      window.history.state,
      '',
      `${path}?layout=TwoColumnsMidExpanded`,
    );
  };

  function getEntries(statusModules = [], specModules = []) {
    specModules.forEach(specItem => {
      const exists = statusModules.some(
        statusItem => statusItem.name === specItem.name,
      );

      if (!exists) {
        statusModules.push({ name: specItem.name });
      }
    });
    return statusModules;
  }

  return (
    <React.Fragment key="modules-list">
      {!detailsOpen &&
        createPortal(
          <ModulesListDeleteBox
            DeleteMessageBox={DeleteMessageBox}
            handleModuleUninstall={handleModuleUninstall}
            selectedModules={selectedModules}
            chosenModuleIndex={chosenModuleIndex}
            kymaResource={kymaResource}
            kymaResourceState={kymaResourceState}
            setKymaResourceState={setKymaResourceState}
            setInitialUnchangedResource={setInitialUnchangedResource}
            setChosenModuleIndex={setChosenModuleIndex}
            moduleTemplates={moduleTemplates}
          />,
          document.body,
        )}
      <div className="sap-margin-small">
        <UnmanagedModuleInfo kymaResource={kymaResource} />
      </div>
      <GenericList
        actions={actions}
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
        customColumnLayout={customColumnLayout}
        enableColumnLayout
        hasDetailsView
        entries={getEntries(resource?.status?.modules, resource?.spec?.modules)}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        noHideFields={['Name', '', 'Namespace']}
        displayArrow
        title={'Modules'}
        sortBy={{
          name: (a, b) => a.name?.localeCompare(b.name),
        }}
        emptyListProps={{
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
        }}
      />
    </React.Fragment>
  );
};
