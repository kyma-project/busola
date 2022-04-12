import React from 'react';
import { LayoutPanel, Icon } from 'fundamental-react';
import { CircleProgress } from 'shared/components/CircleProgress/CircleProgress';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useTranslation } from 'react-i18next';

import { getSIPrefix } from 'shared/helpers/siPrefixes';

const MEMORY_SUFFIX_POWER = {
  // must be sorted from the smallest to the largest; it is case sensitive; more info: https://medium.com/swlh/understanding-kubernetes-resource-cpu-and-memory-units-30284b3cc866
  m: 1e-3,
  K: 1e3,
  Ki: 2 ** 10,
  M: 1e6,
  Mi: 2 ** 20,
  G: 1e9,
  Gi: 2 ** 30,
  Ti: 2 ** 40,
};

function getBytes(memoryString) {
  if (!memoryString || memoryString === '0') {
    return 0;
  }
  const suffixMatch = memoryString.match(/\D+$/);

  if (!suffixMatch?.length) {
    console.warn('error');
    return 0;
  }
  const suffix = suffixMatch[0];
  const number = memoryString.replace(suffix, '');

  const suffixPower = MEMORY_SUFFIX_POWER[suffix];
  if (!suffixPower) {
    console.warn('error');
    return 0;
  }

  return number * suffixPower;
}

export function bytesToHumanReadable(bytes) {
  if (!bytes) return bytes;
  return getSIPrefix(bytes, true, { withoutSpace: true }).string;
}

const MemoryRequestsCircle = ({ resourceQuotas, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <Spinner />;
  } else if (!resourceQuotas) {
    return t('namespaces.overview.resources.error');
  }

  const totalRequests = resourceQuotas.reduce(
    (sum, quota) =>
      sum +
      getBytes(
        quota.status?.hard?.['requests.memory'] || quota.status?.hard?.cpu,
      ),
    0,
  );
  const totalUsage = resourceQuotas.reduce(
    (sum, quota) =>
      sum +
      getBytes(
        quota.status?.used?.['requests.memory'] || quota.status?.used?.cpu,
      ),
    0,
  );

  const valueText = bytesToHumanReadable(totalUsage);
  const maxText = bytesToHumanReadable(totalRequests);

  return (
    <CircleProgress
      color="var(--sapIndicationColor_7)"
      value={totalUsage}
      valueText={valueText}
      max={totalRequests}
      maxText={maxText}
      title={t('namespaces.overview.resources.requests')}
      reversed={true}
      tooltip={{
        content: t('namespaces.tooltips.usage-of-memory-requests', {
          valueText: valueText,
          maxText: maxText,
        }),
        position: 'bottom',
      }}
    />
  );
};

const MemoryLimitsCircle = ({ resourceQuotas, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <Spinner />;
  } else if (!resourceQuotas) {
    return t('namespaces.overview.resources.error');
  }

  const totalLimits = resourceQuotas.reduce(
    (sum, quota) => sum + getBytes(quota.status?.hard?.['limits.memory']), //should we sum it or take the max number?
    0,
  );
  const totalUsage = resourceQuotas.reduce(
    (sum, quota) => sum + getBytes(quota.status?.used?.['limits.memory']), //should we sum it or take the max number?
    0,
  );

  const valueText = bytesToHumanReadable(totalUsage);
  const maxText = bytesToHumanReadable(totalLimits);

  return (
    <CircleProgress
      color="var(--sapIndicationColor_8)"
      value={totalUsage}
      valueText={valueText}
      max={totalLimits}
      maxText={maxText}
      title={t('namespaces.overview.resources.limits')}
      reversed={true}
      tooltip={{
        content: t('namespaces.tooltips.usage-of-memory-limits', {
          valueText: valueText,
          maxText: maxText,
        }),
        position: 'bottom',
      }}
    />
  );
};

export const ResourcesUsage = ({ namespace }) => {
  const { t } = useTranslation();
  const { data: resourceQuotas, loading = true } = useGetList()(
    `/api/v1/namespaces/${namespace}/resourcequotas`,
    {
      pollingInterval: 3300,
    },
  );

  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <Icon
          size="m"
          className="fd-margin-end--sm"
          glyph="it-host"
          ariaLabel="Resource icon"
        />
        <LayoutPanel.Head title={t('namespaces.overview.resources.title')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body className="resources-usage__body">
        <MemoryRequestsCircle
          resourceQuotas={resourceQuotas}
          isLoading={loading}
        />
        <MemoryLimitsCircle
          resourceQuotas={resourceQuotas}
          isLoading={loading}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
