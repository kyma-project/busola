import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import {
  bytesToHumanReadable,
  cpusToHumanReadable,
} from 'shared/helpers/resources';

export function NodeResources({ metrics, resources }) {
  const { t } = useTranslation();
  const { cpu, memory } = metrics || {};

  return cpu && memory ? (
    <>
      <UI5RadialChart
        color="var(--sapChart_OrderedColor_5)"
        value={
          cpusToHumanReadable(cpu.usage, {
            unit: 'm',
          }).value
        }
        max={cpusToHumanReadable(cpu.capacity, { unit: 'm' }).value}
        titleText={t('cluster-overview.statistics.cpu-usage')}
        additionalInfo={`${
          cpusToHumanReadable(cpu.usage, {
            unit: 'm',
          }).string
        } / ${cpusToHumanReadable(cpu.capacity, { unit: 'm' }).string}`}
        accessibleName={t('cluster-overview.statistics.cpu-usage')}
      />
      <UI5RadialChart
        color="var(--sapChart_OrderedColor_6)"
        value={bytesToHumanReadable(memory.usage, { unit: 'Mi' }).value}
        max={bytesToHumanReadable(memory.capacity, { unit: 'Mi' }).value}
        titleText={t('cluster-overview.statistics.memory-usage')}
        additionalInfo={`${bytesToHumanReadable(memory.usage).string} / ${
          bytesToHumanReadable(memory.capacity).string
        }`}
        accessibleName={t('cluster-overview.statistics.memory-usage')}
      />
      <UI5RadialChart
        color="var(--sapChart_OrderedColor_5)"
        value={
          cpusToHumanReadable(resources?.requests?.cpu, {
            unit: 'm',
          }).value
        }
        max={
          cpusToHumanReadable(cpu.capacity, {
            unit: 'm',
          }).value
        }
        titleText={t('cluster-overview.statistics.cpu-requests')}
        additionalInfo={`${
          cpusToHumanReadable(resources?.requests?.cpu, {
            unit: 'm',
          }).string
        } / ${
          cpusToHumanReadable(cpu.capacity, {
            unit: 'm',
          }).string
        }`}
        accessibleName={t('cluster-overview.statistics.cpu-requests')}
      />
      <UI5RadialChart
        color="var(--sapChart_OrderedColor_6)"
        value={
          bytesToHumanReadable(resources.requests?.memory, { unit: 'Gi' }).value
        }
        max={bytesToHumanReadable(memory.capacity, { unit: 'Gi' }).value}
        titleText={t('cluster-overview.statistics.memory-requests')}
        additionalInfo={`${
          bytesToHumanReadable(resources.requests?.memory, { unit: 'Gi' })
            .string
        } / ${bytesToHumanReadable(memory.capacity, { unit: 'Gi' }).string}`}
        accessibleName={t('cluster-overview.statistics.memory-requests')}
      />
      <UI5RadialChart
        color="var(--sapChart_OrderedColor_5)"
        value={
          cpusToHumanReadable(resources?.limits?.cpu, {
            unit: 'm',
          }).value
        }
        max={
          cpusToHumanReadable(cpu.capacity, {
            unit: 'm',
          }).value
        }
        titleText={t('cluster-overview.statistics.cpu-limits')}
        additionalInfo={`${
          cpusToHumanReadable(resources?.limits?.cpu, {
            unit: 'm',
          }).string
        } / ${
          cpusToHumanReadable(cpu.capacity, {
            unit: 'm',
          }).string
        }`}
        accessibleName={t('cluster-overview.statistics.cpu-limits')}
      />
      <UI5RadialChart
        color="var(--sapChart_OrderedColor_6)"
        value={
          bytesToHumanReadable(resources.limits.memory, { unit: 'Gi' }).value
        }
        max={bytesToHumanReadable(memory.capacity, { unit: 'Gi' }).value}
        titleText={t('cluster-overview.statistics.memory-limits')}
        additionalInfo={`${
          bytesToHumanReadable(resources.limits.memory, { unit: 'Gi' }).string
        } / ${bytesToHumanReadable(memory.capacity, { unit: 'Gi' }).string}`}
        accessibleName={t('cluster-overview.statistics.memory-limits')}
      />
    </>
  ) : (
    t('components.error-panel.error')
  );
}
