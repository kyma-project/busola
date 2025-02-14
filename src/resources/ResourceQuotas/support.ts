import {
  bytesToHumanReadable,
  cpusToHumanReadable,
  getBytes,
  getCpus,
} from 'resources/Namespaces/ResourcesUsage';
import { ResourceQuotaProps } from './ResourceQuotaDetails';
import { roundTwoDecimals } from 'shared/utils/helpers';
import { calculateMetrics } from 'resources/Pods/podQueries';
import { UsageMetrics } from 'resources/Pods/types';
import { isEmpty } from 'lodash';

export const getLimitsAndUsageChartsData = (
  resource?: ResourceQuotaProps,
  podsMetrics?: UsageMetrics[],
) => {
  const totalLimitsCpu = getCpus(resource?.status?.hard?.['limits.cpu']);
  const totalLimitsUsageCpu = getCpus(resource?.status?.used?.['limits.cpu']);
  const totalLimits = getBytes(resource?.status?.hard?.['limits.memory']);
  const totalLimitsUsage = getBytes(resource?.status?.used?.['limits.memory']);
  const totalRequestsCpu = getCpus(resource?.status?.hard?.['requests.cpu']);
  const totalRequestsUsageCpu = getCpus(
    resource?.status?.used?.['requests.cpu'],
  );
  const totalRequests = getBytes(
    resource?.status?.hard?.['requests.memory'] ??
      resource?.status?.hard?.memory,
  );
  const totalRequestsUsage = getBytes(
    resource?.status?.used?.['requests.memory'] ??
      resource?.status?.used?.memory,
  );
  const { cpu, memory } = calculateMetrics(podsMetrics);

  return [
    ...(podsMetrics?.length
      ? [
          {
            headerTitle: 'cluster-overview.statistics.cpu-usage',
            value: roundTwoDecimals(cpu.usage) as number,
            max: roundTwoDecimals(cpu.capacity) as number,
            color: 'var(--sapChart_OrderedColor_5)',
            additionalInfo: `${cpusToHumanReadable(cpu.usage, {
              unit: 'm',
            })} / ${cpusToHumanReadable(cpu.capacity, { unit: 'm' })}`,
          },
          {
            headerTitle: 'cluster-overview.statistics.memory-usage',
            value: roundTwoDecimals(memory.usage) as number,
            max: roundTwoDecimals(memory.capacity) as number,
            color: 'var(--sapChart_OrderedColor_6)',
            additionalInfo: `${roundTwoDecimals(
              memory.usage,
            )}Gi / ${roundTwoDecimals(memory.capacity)}Gi`,
          },
        ]
      : []),
    ...(!isEmpty(resource?.status)
      ? [
          {
            headerTitle: 'cluster-overview.statistics.cpu-limits',
            value: totalLimitsUsageCpu,
            max: totalLimitsCpu,
            color: 'var(--sapChart_OrderedColor_5)',
            additionalInfo: `${cpusToHumanReadable(totalLimitsUsageCpu, {
              unit: 'm',
            })} / ${cpusToHumanReadable(totalLimitsCpu, {
              unit: 'm',
            })}`,
          },
          {
            headerTitle: 'namespaces.overview.resources.limits',
            value: totalLimitsUsage,
            max: totalLimits,
            color: 'var(--sapChart_OrderedColor_6)',
            additionalInfo: `${bytesToHumanReadable(
              totalLimitsUsage,
            )} / ${bytesToHumanReadable(totalLimits)}`,
          },
          {
            headerTitle: 'cluster-overview.statistics.cpu-requests',
            value: totalRequestsUsageCpu,
            max: totalRequestsCpu,
            color: 'var(--sapChart_OrderedColor_5)',
            additionalInfo: `${cpusToHumanReadable(totalRequestsUsageCpu, {
              unit: 'm',
            })} / ${cpusToHumanReadable(totalRequestsCpu, {
              unit: 'm',
            })}`,
          },
          {
            headerTitle: 'namespaces.overview.resources.requests',
            value: totalRequestsUsage,
            max: totalRequests,
            color: 'var(--sapChart_OrderedColor_6)',
            additionalInfo: `${bytesToHumanReadable(
              totalRequestsUsage,
            )} / ${bytesToHumanReadable(totalRequests)}`,
          },
        ]
      : []),
  ];
};
