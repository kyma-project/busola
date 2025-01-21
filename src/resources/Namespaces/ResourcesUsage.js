import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useTranslation } from 'react-i18next';

import { formatResourceUnit } from 'shared/helpers/resources.js';
import { Card, CardHeader } from '@ui5/webcomponents-react';

const MEMORY_SUFFIX_POWER = {
  // must be sorted from the smallest to the largest; it is case sensitive; more info: https://medium.com/swlh/understanding-kubernetes-resource-cpu-and-memory-units-30284b3cc866
  m: 1e-3,
  k: 1e3,
  K: 1e3,
  Ki: 2 ** 10,
  M: 1e6,
  Mi: 2 ** 20,
  G: 1e9,
  Gi: 2 ** 30,
  Ti: 2 ** 40,
};

const CPU_SUFFIX_POWER = {
  m: 1e-3,
  n: 1e-9,
};

export function getBytes(memoryStr) {
  if (!memoryStr) return 0;

  const unit = String(memoryStr).match(/[a-zA-Z]+/g)?.[0];
  const value = parseFloat(memoryStr);
  const bytes = value * (MEMORY_SUFFIX_POWER[unit] || 1);
  return bytes;
}

export function getCpus(cpuString) {
  if (!cpuString || cpuString === '0') {
    return 0;
  }

  const suffix = String(cpuString).slice(-1);

  const suffixPower = CPU_SUFFIX_POWER[suffix];
  if (!suffixPower) {
    return parseFloat(cpuString);
  }

  const number = String(cpuString).replace(suffix, '');
  return number * suffixPower;
}

export function bytesToHumanReadable(bytes) {
  if (!bytes) return bytes;
  return formatResourceUnit(bytes, true, { withoutSpace: true });
}

export function cpusToHumanReadable(cpus, { fixed = 0, unit = '' } = {}) {
  if (!cpus) return cpus;
  return formatResourceUnit(cpus, false, { withoutSpace: true, fixed, unit });
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
        quota.status?.hard?.['requests.memory'] || quota.status?.hard?.memory,
      ),
    0,
  );
  const totalUsage = resourceQuotas.reduce(
    (sum, quota) =>
      sum +
      getBytes(
        quota.status?.used?.['requests.memory'] || quota.status?.used?.memory,
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
    (sum, quota) => sum + getBytes(quota.status?.hard?.['limits.memory']),
    0,
  );
  const totalUsage = resourceQuotas.reduce(
    (sum, quota) => sum + getBytes(quota.status?.used?.['limits.memory']),
    0,
  );

  const valueText = bytesToHumanReadable(totalUsage);
  const maxText = bytesToHumanReadable(totalLimits);

  return (
    <UI5RadialChart
      color="var(--sapChart_OrderedColor_6)"
      value={totalUsage}
      max={totalLimits}
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
  if (resourceQuotas?.length < 1) return null;
  return (
    <>
      <div className="item-wrapper card-tall">
        <Card
          className="radial-chart-card"
          header={
            <CardHeader
              titleText={t('namespaces.overview.resources.requests')}
            />
          }
        >
          <MemoryRequestsCircle
            resourceQuotas={resourceQuotas}
            isLoading={loading}
          />
        </Card>
      </div>
      <div className="item-wrapper card-tall">
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
      </div>
    </>
  );
};
