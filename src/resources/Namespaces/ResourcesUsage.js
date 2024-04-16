import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useTranslation } from 'react-i18next';

import { getSIPrefix } from 'shared/helpers/siPrefixes';
import { Card, CardHeader } from '@ui5/webcomponents-react';

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
    <UI5RadialChart
      color="var(--sapChart_OrderedColor_5)"
      value={totalUsage}
      max={totalRequests}
      tooltip={{
        content: t('namespaces.tooltips.usage-of-memory-requests', {
          valueText: valueText,
          maxText: maxText,
        }),
        position: 'bottom',
      }}
      additionalInfo={`${valueText} / ${maxText}`}
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
    <UI5RadialChart
      color="var(--sapChart_OrderedColor_6)"
      value={totalUsage}
      max={totalLimits}
      tooltip={{
        content: t('namespaces.tooltips.usage-of-memory-limits', {
          valueText: valueText,
          maxText: maxText,
        }),
        position: 'bottom',
      }}
      additionalInfo={`${valueText} / ${maxText}`}
    />
  );
};

export const ResourcesUsage = ({ namespace }) => {
  const { t } = useTranslation();
  const { data: resourceQuotas, loading = true } = useGetList()(
    namespace
      ? `/api/v1/namespaces/${namespace}/resourcequotas`
      : '/api/v1/resourcequotas',
    {
      pollingInterval: 3300,
    },
  );

  return (
    <>
      <Card
        className="radial-chart-card"
        header={
          <CardHeader titleText={t('namespaces.overview.resources.requests')} />
        }
      >
        <MemoryRequestsCircle
          resourceQuotas={resourceQuotas}
          isLoading={loading}
        />
      </Card>
      <Card
        className="radial-chart-card"
        header={
          <CardHeader titleText={t('namespaces.overview.resources.limits')} />
        }
      >
        <MemoryLimitsCircle
          resourceQuotas={resourceQuotas}
          isLoading={loading}
        />
      </Card>
    </>
  );
};
