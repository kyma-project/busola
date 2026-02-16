import { useEffect, useState } from 'react';
import { Tag, Text } from '@ui5/webcomponents-react';
import { compare } from 'compare-versions';
import {
  findModuleStatus,
  findModuleTemplate,
  KymaResourceType,
  ModuleTemplateListType,
  ModuleTemplateStatus,
  ModuleTemplateType,
  resolveInstallationStateName,
} from '../support';
import { useGetManagerStatus, useGetModuleResource } from '../hooks';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';
import { useModulesReleaseQuery } from '../kymaModulesQueries';
import { ModuleStatus, resolveType } from './ModuleStatus';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { toSentenceCase } from 'shared/utils/helpers';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';
import { TFunction } from 'i18next';
import { ProtectedResourceWarning } from 'shared/components/ProtectedResourcesButton';
import { usePopulateWithNamespace } from 'hooks/usePopulateWithNamespace';

type RowResourceType = {
  name: string;
  channel: string;
  version: string;
  templateVersion?: string;
  resource: { kind: string; metadata: { namespace: string } };
  fakeStatus: any;
  namespace?: string;
};

type ModuleReleaseMetasType = {
  items: { spec: { moduleName: string; beta: boolean } }[];
};

type ModulesListRowsProps = {
  resourceName: string;
  resource: RowResourceType;
  kymaResource?: KymaResourceType;
  moduleTemplates: ModuleTemplateListType;
  protectedResource?: boolean;
  hasDetailsLink: (resource: RowResourceType) => boolean;
};

export const ModulesListRows = ({
  resourceName,
  resource,
  moduleTemplates,
  hasDetailsLink,
  kymaResource,
  protectedResource,
}: ModulesListRowsProps) => {
  const { t } = useTranslation();
  const { data: moduleReleaseMetas } = useModulesReleaseQuery({
    skip: !resourceName,
  });

  const [moduleResourceWithNamespace, setModuleResourceWithNamespace] =
    useState<any>(null);

  const populateWithNamespace = usePopulateWithNamespace();
  const findModuleReleaseMeta = (moduleName: string) => {
    return (moduleReleaseMetas as ModuleReleaseMetasType | null)?.items.find(
      (item) => item.spec.moduleName === moduleName,
    );
  };

  const checkBeta = (
    module: ModuleTemplateType | undefined,
    currentModuleReleaseMeta?: { spec: { moduleName: string; beta: boolean } },
  ) => {
    return (
      module?.metadata.labels['operator.kyma-project.io/beta'] === 'true' ||
      currentModuleReleaseMeta?.spec?.beta === true
    );
  };

  const currentModuleTemplate = findModuleTemplate(
    moduleTemplates,
    resource?.name,
    resource?.channel || kymaResource?.spec?.channel || '',
    resource?.templateVersion || resource?.version,
    resource?.namespace,
  );

  useEffect(() => {
    const checkIfNamespaceIsMissing = async () => {
      if (currentModuleTemplate?.spec?.data?.metadata?.namespace) {
        setModuleResourceWithNamespace(currentModuleTemplate?.spec.data);
      } else {
        const newModuleResource = await populateWithNamespace(
          currentModuleTemplate?.spec.data,
        );
        setModuleResourceWithNamespace(newModuleResource);
      }
    };
    checkIfNamespaceIsMissing();
  }, [currentModuleTemplate]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: moduleResource } = useGetModuleResource(
    moduleResourceWithNamespace,
  );

  const moduleStatus = kymaResource
    ? findModuleStatus(kymaResource, resource.name)
    : {
        name: resource.name,
        resource: moduleResource,
        version: resource.version,
        channel: resource.channel,
        state: moduleResource?.status?.state,
        message: moduleResource?.status?.message,
        maintenance: false,
      };

  const showDetailsLink = hasDetailsLink(resource);
  const moduleIndex =
    kymaResource?.spec?.modules?.findIndex((kymaResourceModule) => {
      return kymaResourceModule?.name === resource?.name;
    }) ?? -1;

  const { data, error: managerResourceStateError } = useGetManagerStatus(
    currentModuleTemplate?.spec?.manager,
  );
  let managerResourceState = data;

  if (resource.fakeStatus) {
    managerResourceState = resource.fakeStatus;
  }
  if (moduleStatus && !moduleStatus.resource && moduleResourceWithNamespace) {
    const moduleCr = moduleResourceWithNamespace;

    moduleStatus.resource = {
      kind: moduleCr.kind,
      apiVersion: moduleCr.apiVersion,
      metadata: {
        name: moduleCr.metadata.name,
        namespace: moduleCr.metadata.namespace,
      },
    };
  }

  const moduleDocs =
    currentModuleTemplate?.spec?.info?.documentation ||
    currentModuleTemplate?.metadata?.annotations[
      'operator.kyma-project.io/doc-url'
    ];

  const currentModuleReleaseMeta = findModuleReleaseMeta(resource.name);
  const resolvedInstallationStateName = resolveInstallationStateName(
    moduleStatus?.state,
    !!currentModuleTemplate?.spec?.manager,
    managerResourceState?.state,
    !!managerResourceStateError,
  );

  const isChannelOverridden = moduleIndex
    ? kymaResource?.spec?.modules?.[moduleIndex]?.channel !== undefined
    : false;

  return [
    // Name
    <>
      {showDetailsLink ? (
        <Text style={{ fontWeight: 'bold', color: 'var(--sapTextColor)' }}>
          {resource.name}
        </Text>
      ) : (
        resource.name
      )}
      {protectedResource && <ProtectedResourceWarning entry={kymaResource} />}
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
      {moduleStatus?.state === ModuleTemplateStatus.Unmanaged && (
        <Tag
          className="sap-margin-begin-tiny"
          hideStateIcon
          colorScheme="5"
          design="Set2"
        >
          {moduleStatus.state}
        </Tag>
      )}
    </>,
    // Namespace
    moduleStatus?.resource?.metadata?.namespace || EMPTY_TEXT_PLACEHOLDER,
    // Channel
    <>
      {moduleStatus?.channel
        ? moduleStatus?.channel
        : ((kymaResource?.spec?.modules?.[moduleIndex]?.channel ||
            kymaResource?.spec?.channel ||
            currentModuleTemplate?.spec?.channel) ??
          EMPTY_TEXT_PLACEHOLDER)}
      {isChannelOverridden ? (
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
    <>
      {moduleStatus?.version || EMPTY_TEXT_PLACEHOLDER}
      {!kymaResource &&
        resource?.templateVersion &&
        resource?.version &&
        compare(resource?.templateVersion, resource?.version, '>') && (
          <Tag
            className="sap-margin-begin-tiny"
            hideStateIcon
            colorScheme="6"
            design="Set2"
          >
            {t('kyma-modules.upgrade-available')}
          </Tag>
        )}
    </>,
    // Module State
    <ModuleStatus
      key={`module-state-${resource.name}`}
      resource={moduleStatus}
    />,
    // Installation State
    kymaResource
      ? kymaInstallationStateColumn(
          resolvedInstallationStateName,
          moduleStatus,
          managerResourceState,
          resource?.name,
          t,
        )
      : installationStateColumn(managerResourceState, resource?.name),
    // Documentation
    moduleDocs ? (
      <ExternalLink url={moduleDocs}>{t('common.headers.link')}</ExternalLink>
    ) : (
      EMPTY_TEXT_PLACEHOLDER
    ),
  ];
};

function installationStateColumn(
  managerResourceState: any,
  resourceName: string,
) {
  let type: ValueState = ValueState.None;
  if (managerResourceState.state) {
    type = resolveType(managerResourceState.state);
  } else if (managerResourceState.status === 'True') {
    type = ValueState.Positive;
  } else if (managerResourceState.status === 'False') {
    type = ValueState.Critical;
  }
  return (
    <StatusBadge
      key={`installation-state-${resourceName}`}
      resourceKind="community-modules"
      type={type}
      tooltipContent={managerResourceState?.message}
    >
      {toSentenceCase(
        managerResourceState?.state ?? managerResourceState?.type,
      )}
    </StatusBadge>
  );
}

function kymaInstallationStateColumn(
  resolvedInstallationStateName: string,
  moduleStatus: any,
  managerResourceState: any,
  resourceName: string,
  t: TFunction,
) {
  return (
    <>
      <StatusBadge
        key={`installation-state-${resourceName}`}
        resourceKind="kymas"
        type={resolveType(resolvedInstallationStateName)}
        tooltipContent={moduleStatus?.message ?? managerResourceState?.message}
      >
        {toSentenceCase(resolvedInstallationStateName)}
      </StatusBadge>
      {moduleStatus?.maintenance === true && (
        <StatusBadge
          type="Critical"
          className="sap-margin-begin-tiny"
          key={`pending-maintenance-${resourceName}`}
          tooltipContent={t('kyma-modules.maintenance-tooltip')}
        >
          {t('kyma-modules.maintenance')}
        </StatusBadge>
      )}
    </>
  );
}
