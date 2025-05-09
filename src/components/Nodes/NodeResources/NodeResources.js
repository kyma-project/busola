import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import './NodeResources.scss';
import {
  bytesToHumanReadable,
  cpusToHumanReadable,
} from '../../../resources/Namespaces/ResourcesUsage.js';

export function NodeResources({ metrics, resources }) {
  const { t } = useTranslation();
  const { cpu, memory } = metrics || {};

  return cpu && memory ? (
    <>
      <Card
        className="radial-chart-card"
        header={
          <CardHeader titleText={t('cluster-overview.statistics.cpu-usage')} />
        }
      >
        <UI5RadialChart
          color="var(--sapChart_OrderedColor_5)"
          value={
            cpusToHumanReadable(cpu.usage, {
              unit: 'm',
            }).value
          }
          max={cpusToHumanReadable(cpu.capacity, { unit: 'm' }).value}
          additionalInfo={`${
            cpusToHumanReadable(cpu.usage, {
              unit: 'm',
            }).string
          } / ${cpusToHumanReadable(cpu.capacity, { unit: 'm' }).string}`}
        />
      </Card>
      <Card
        className="radial-chart-card"
        header={
          <CardHeader
            titleText={t('cluster-overview.statistics.memory-usage')}
          />
        }
      >
        <UI5RadialChart
          color="var(--sapChart_OrderedColor_6)"
          value={bytesToHumanReadable(memory.usage, { unit: 'Mi' }).value}
          max={bytesToHumanReadable(memory.capacity, { unit: 'Mi' }).value}
          additionalInfo={`${bytesToHumanReadable(memory.usage).string} / ${
            bytesToHumanReadable(memory.capacity).string
          }`}
        />
      </Card>
      <Card
        className="radial-chart-card"
        header={
          <CardHeader
            titleText={t('cluster-overview.statistics.cpu-requests')}
          />
        }
      >
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
          additionalInfo={`${
            cpusToHumanReadable(resources?.requests?.cpu, {
              unit: 'm',
            }).string
          } / ${
            cpusToHumanReadable(cpu.capacity, {
              unit: 'm',
            }).string
          }`}
        />
      </Card>
      <Card
        className="radial-chart-card"
        header={
          <CardHeader
            titleText={t('cluster-overview.statistics.memory-requests')}
          />
        }
      >
        <UI5RadialChart
          color="var(--sapChart_OrderedColor_6)"
          value={
            bytesToHumanReadable(resources.requests?.memory, { unit: 'Gi' })
              .value
          }
          max={bytesToHumanReadable(memory.capacity, { unit: 'Gi' }).value}
          additionalInfo={`${
            bytesToHumanReadable(resources.requests?.memory, { unit: 'Gi' })
              .string
          } / ${bytesToHumanReadable(memory.capacity, { unit: 'Gi' }).string}`}
        />
      </Card>
      <Card
        className="radial-chart-card"
        header={
          <CardHeader titleText={t('cluster-overview.statistics.cpu-limits')} />
        }
      >
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
          additionalInfo={`${
            cpusToHumanReadable(resources?.limits?.cpu, {
              unit: 'm',
            }).string
          } / ${
            cpusToHumanReadable(cpu.capacity, {
              unit: 'm',
            }).string
          }`}
        />
      </Card>
      <Card
        className="radial-chart-card"
        header={
          <CardHeader
            titleText={t('cluster-overview.statistics.memory-limits')}
          />
        }
      >
        <UI5RadialChart
          color="var(--sapChart_OrderedColor_6)"
          value={
            bytesToHumanReadable(resources.limits.memory, { unit: 'Gi' }).value
          }
          max={bytesToHumanReadable(memory.capacity, { unit: 'Gi' }).value}
          additionalInfo={`${
            bytesToHumanReadable(resources.limits.memory, { unit: 'Gi' }).string
          } / ${bytesToHumanReadable(memory.capacity, { unit: 'Gi' }).string}`}
        />
      </Card>
    </>
  ) : (
    t('components.error-panel.error')
  );
}
