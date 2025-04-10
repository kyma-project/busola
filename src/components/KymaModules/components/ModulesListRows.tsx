import { Tag, Text } from '@ui5/webcomponents-react';
import {
  findModuleStatus,
  findModuleTemplate,
  KymaResourceType,
  ModuleTemplateListType,
  ModuleTemplateType,
} from '../support';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';
import { useModulesReleaseQuery } from '../kymaModulesQueries';
import { ModuleStatus, resolveType } from './ModuleStatus';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

type RowResourceType = {
  name: string;
  channel: string;
  version: string;
  resource: { kind: string };
};

type ModuleReleaseMetasType = {
  items: { spec: { moduleName: string; beta: boolean } }[];
};

type ModulesListRowsProps = {
  resourceName: string;
  resource: RowResourceType;
  kymaResource: KymaResourceType;
  moduleTemplates: ModuleTemplateListType;
  hasDetailsLink: (resource: RowResourceType) => boolean;
};

export const ModulesListRows = ({
  resourceName,
  resource,
  kymaResource,
  moduleTemplates,
  hasDetailsLink,
}: ModulesListRowsProps) => {
  const { t } = useTranslation();
  const { data: moduleReleaseMetas } = useModulesReleaseQuery({
    skip: !resourceName,
  });
  const findModuleReleaseMeta = (moduleName: string) => {
    return (moduleReleaseMetas as ModuleReleaseMetasType | null)?.items.find(
      item => item.spec.moduleName === moduleName,
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

  if (
    moduleStatus &&
    !moduleStatus.resource &&
    currentModuleTemplate?.spec?.data
  ) {
    const moduleCr = currentModuleTemplate?.spec?.data;

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
    <ModuleStatus key="module-state" resource={moduleStatus} />,
    // Installation State
    <StatusBadge
      key="installation-state"
      resourceKind="kymas"
      type={resolveType(moduleStatus?.state ?? '')}
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
