import {
  bytesToHumanReadable,
  cpusToHumanReadable,
  getBytes,
  getCpus,
} from 'resources/Namespaces/ResourcesUsage';
import { ResourceQuotaProps } from './ResourceQuotaDetails';

export const getLimitsAndUsageChartsData = (resource: ResourceQuotaProps) => {
  const totalLimitsCpu = getCpus(resource?.status?.hard?.['limits.cpu']);
  const totalLimitsUsageCpu = getCpus(resource?.status?.used?.['limits.cpu']);
  const totalLimits = getBytes(resource?.status?.hard?.['limits.memory']);
  const totalLimitsUsage = getBytes(resource?.status?.used?.['limits.memory']);
  const totalRequestsCpu = getCpus(resource?.status?.hard?.['requests.cpu']);
  const totalRequestsUsageCpu = getCpus(
    resource?.status?.used?.['requests.cpu'],
  );
  const totalRequests = getBytes(
    resource?.status?.hard?.['requests.memory'] ||
      resource?.status?.hard?.memory,
  );
  const totalRequestsUsage = getBytes(
    resource?.status?.used?.['requests.memory'] ||
      resource?.status?.used?.memory,
  );

  return [
    {
      headerTitle: 'cluster-overview.statistics.cpu-limits',
      value: totalLimitsUsageCpu,
      max: totalLimitsCpu,
      color: 'var(--sapChart_OrderedColor_6)',
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
      color: 'var(--sapChart_OrderedColor_5)',
      additionalInfo: `${bytesToHumanReadable(
        totalRequestsUsage,
      )} / ${bytesToHumanReadable(totalRequests)}`,
    },
  ];
};
