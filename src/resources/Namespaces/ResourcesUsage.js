import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { useTranslation } from 'react-i18next';

import { formatResourceUnit } from 'shared/helpers/resources.js';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import {
  calculateMetrics,
  usePodsMetricsQuery,
} from 'resources/Pods/podQueries';
import { Spinner } from 'shared/components/Spinner/Spinner';

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

export function bytesToHumanReadable(bytes, { fixed = 0, unit = '' } = {}) {
  return formatResourceUnit(bytes, true, { withoutSpace: true, fixed, unit });
}

export function cpusToHumanReadable(cpus, { fixed = 0, unit = '' } = {}) {
  return formatResourceUnit(cpus, false, { withoutSpace: true, fixed, unit });
}

export const ResourcesUsage = ({ namespace }) => {
  const { t } = useTranslation();
  const { podsMetrics, error, loading } = usePodsMetricsQuery(namespace);
  const { cpu, memory } = calculateMetrics(podsMetrics);

  if (loading) {
    return <Spinner />;
  } else if (error) {
    return (
      <div className="item-wrapper card-small pods-metrics-error">
        <Card
          className="item"
          header={
            <CardHeader titleText={t('namespaces.overview.resources.error')} />
          }
        />
      </div>
    );
  } else if (!podsMetrics?.length) return null;

  return (
    <>
      <div className="item-wrapper card-tall">
        <Card
          className="radial-chart-card item"
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.cpu-usage')}
            />
          }
        >
          <UI5RadialChart
            color="var(--sapChart_OrderedColor_5)"
            value={
              cpusToHumanReadable(cpu.usage, {
                unit: 'm',
              }).value
            }
            max={
              cpusToHumanReadable(cpu.capacity, {
                unit: 'm',
              }).value
            }
            additionalInfo={`${
              cpusToHumanReadable(cpu.usage, {
                unit: 'm',
              }).string
            } / ${
              cpusToHumanReadable(cpu.capacity, {
                unit: 'm',
              }).string
            }`}
          />
        </Card>
      </div>
      <div className="item-wrapper card-tall">
        <Card
          className="radial-chart-card item"
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.memory-usage')}
            />
          }
        >
          <UI5RadialChart
            color="var(--sapChart_OrderedColor_6)"
            value={memory.usage}
            max={memory.capacity}
            additionalInfo={`${bytesToHumanReadable(memory.usage).string} / ${
              bytesToHumanReadable(memory.capacity).string
            }`}
          />
        </Card>
      </div>
    </>
  );
};
