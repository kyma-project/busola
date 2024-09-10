import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import './ResourceQuotaDetails.scss';
import { ResourceQuotaProps } from './ResourceQuotaDetails';

type ResourceTableEntry = {
  resource: string;
  used: string;
  hard: string;
};

export default function ResourceQuotaLimits({
  resource,
  isCompact = false,
}: {
  resource: ResourceQuotaProps;
  isCompact?: boolean;
}) {
  const { t } = useTranslation();

  const headerRenderer = () => [
    t('resource-quotas.headers.resource'),
    t('resource-quotas.headers.hard'),
    t('resource-quotas.headers.used'),
  ];

  const parsedResourceQuota = useMemo(() => {
    const result: ResourceTableEntry[] = [];

    const hardResources = resource.spec.hard;
    const usedResources = resource.status.used;

    for (const resource in hardResources) {
      if (hardResources.hasOwnProperty(resource)) {
        result.push({
          resource,
          hard: hardResources[resource],
          used: usedResources[resource] || '0',
        });
      }
    }

    return result;
  }, [resource.spec.hard, resource.status.used]);

  const rowRenderer = ({ resource, used, hard }: ResourceTableEntry) => {
    return [
      resource || EMPTY_TEXT_PLACEHOLDER,
      hard || EMPTY_TEXT_PLACEHOLDER,
      used || EMPTY_TEXT_PLACEHOLDER,
    ];
  };

  return (
    <GenericList
      title={!isCompact ? t('resource-quotas.headers.limits-usage') : null}
      entries={parsedResourceQuota || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      searchSettings={{
        showSearchField: false,
      }}
      className={`resource-quota-limits ${isCompact ? 'compact' : ''}`}
    />
  );
}
