import {
  bytesToHumanReadable,
  cpusToHumanReadable,
  getBytes,
  getCpus,
} from 'shared/helpers/resources';
import { ResourceQuota } from './ResourceQuotaDetails';
import { calculateMetrics } from 'resources/Pods/podQueries';
import { UsageMetrics } from 'resources/Pods/types';
import { isEmpty } from 'lodash';

// It takes resource limits and requests and maps it to data suitable for charts to make it easier to iterate and render.
export const mapLimitsAndRequestsToChartsData = (resource?: ResourceQuota) => {
  if (isEmpty(resource?.status)) {
    return [];
  }

  const totalCpuLimits = getCpus(resource?.status?.hard?.['limits.cpu']);
  const totalUsageCpuLimits = getCpus(resource?.status?.used?.['limits.cpu']);
  const totalMemoryLimits = getBytes(resource?.status?.hard?.['limits.memory']);
  const totalUsageMemoryLimits = getBytes(
    resource?.status?.used?.['limits.memory'],
  );
  const totalCpuRequests = getCpus(resource?.status?.hard?.['requests.cpu']);
  const totalUsageCpuRequests = getCpus(
    resource?.status?.used?.['requests.cpu'],
  );
  const totalMemoryRequests = getBytes(
    resource?.status?.hard?.['requests.memory'] ??
      resource?.status?.hard?.memory,
  );
  const totalUsageMemoryRequests = getBytes(
    resource?.status?.used?.['requests.memory'] ??
      resource?.status?.used?.memory,
  );
  return [
    {
      headerTitle: 'cluster-overview.statistics.cpu-limits',
      value: cpusToHumanReadable(totalUsageCpuLimits, {
        unit: 'm',
      }).value,
      max: cpusToHumanReadable(totalCpuLimits, {
        unit: 'm',
      }).value,
      color: 'var(--sapChart_OrderedColor_5)',
      additionalInfo: `${
        cpusToHumanReadable(totalUsageCpuLimits, {
          unit: 'm',
        }).string
      } / ${
        cpusToHumanReadable(totalCpuLimits, {
          unit: 'm',
        }).string
      }`,
    },
    {
      headerTitle: 'namespaces.overview.resources.limits',
      value: bytesToHumanReadable(totalUsageMemoryLimits, {
        unit: 'Gi',
      }).value,
      max: bytesToHumanReadable(totalMemoryLimits, {
        unit: 'Gi',
      }).value,
      color: 'var(--sapChart_OrderedColor_6)',
      additionalInfo: `${
        bytesToHumanReadable(totalUsageMemoryLimits, {
          unit: 'Gi',
        }).string
      } / ${
        bytesToHumanReadable(totalMemoryLimits, {
          unit: 'Gi',
        }).string
      }`,
    },
    {
      headerTitle: 'cluster-overview.statistics.cpu-requests',
      value: cpusToHumanReadable(totalUsageCpuRequests, {
        unit: 'm',
      }).value,
      max: cpusToHumanReadable(totalCpuRequests, {
        unit: 'm',
      }).value,
      color: 'var(--sapChart_OrderedColor_5)',
      additionalInfo: `${
        cpusToHumanReadable(totalUsageCpuRequests, {
          unit: 'm',
        }).string
      } / ${
        cpusToHumanReadable(totalCpuRequests, {
          unit: 'm',
        }).string
      }`,
    },
    {
      headerTitle: 'namespaces.overview.resources.requests',
      value: bytesToHumanReadable(totalUsageMemoryRequests, {
        unit: 'Gi',
      }).value,
      max: bytesToHumanReadable(totalMemoryRequests, {
        unit: 'Gi',
      }).value,
      color: 'var(--sapChart_OrderedColor_6)',
      additionalInfo: `${
        bytesToHumanReadable(totalUsageMemoryRequests, {
          unit: 'Gi',
        }).string
      } / ${
        bytesToHumanReadable(totalMemoryRequests, {
          unit: 'Gi',
        }).string
      }`,
    },
  ];
};

// It takes pods metrics, calculates and maps it to data suitable for charts to make it easier to iterate and render.
export const mapUsagesToChartsData = (podsMetrics?: UsageMetrics[]) => {
  if (!podsMetrics?.length) {
    return [];
  }

  const { cpu, memory } = calculateMetrics(podsMetrics);
  return [
    {
      headerTitle: 'cluster-overview.statistics.cpu-usage',
      value: cpusToHumanReadable(cpu.usage, {
        unit: 'm',
      }).value,
      max: cpusToHumanReadable(cpu.capacity, { unit: 'm' }).value,
      color: 'var(--sapChart_OrderedColor_5)',
      additionalInfo: `${
        cpusToHumanReadable(cpu.usage, {
          unit: 'm',
        }).string
      } / ${cpusToHumanReadable(cpu.capacity, { unit: 'm' }).string}`,
    },
    {
      headerTitle: 'cluster-overview.statistics.memory-usage',
      value: bytesToHumanReadable(memory.usage).value,
      max: bytesToHumanReadable(memory.capacity).value,
      color: 'var(--sapChart_OrderedColor_6)',
      additionalInfo: `${bytesToHumanReadable(memory.usage).string} / ${
        bytesToHumanReadable(memory.capacity).string
      }`,
    },
  ];
};
