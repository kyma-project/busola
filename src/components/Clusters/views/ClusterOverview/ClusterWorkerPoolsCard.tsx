import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  Text,
} from '@ui5/webcomponents-react';
import { useGetClusterInfo, WorkerPool } from './useGetClusterInfo';

function hasHaZones(haZones: WorkerPool['haZones']): boolean {
  if (Array.isArray(haZones)) return haZones.length > 0;
  return !!haZones;
}

export default function ClusterWorkerPoolsCard() {
  const { t } = useTranslation();
  const { clusterInfo, loading } = useGetClusterInfo();

  const pools = Object.values(clusterInfo?.workerPools ?? {});

  if (loading || pools.length === 0) return null;

  const columns = [
    t('clusters.overview.worker-pools.pool'),
    t('clusters.overview.worker-pools.machine-type'),
    t('clusters.overview.worker-pools.min-nodes'),
    t('clusters.overview.worker-pools.max-nodes'),
    t('clusters.overview.worker-pools.ha-zones'),
  ];

  return (
    <Card
      className="resource-card"
      header={
        <CardHeader
          titleText={`${t('clusters.overview.worker-pools.title')} (${pools.length})`}
        />
      }
    >
      <Table
        overflowMode="Popin"
        headerRow={
          <TableHeaderRow>
            {columns.map((column) => (
              <TableHeaderCell key={`header-${column}`}>
                {column}
              </TableHeaderCell>
            ))}
          </TableHeaderRow>
        }
      >
        {pools.map((pool, index) => (
          <TableRow key={`row-${pool?.name ?? ''}-${index}`}>
            <TableCell>
              <Text>{pool?.name}</Text>
            </TableCell>
            <TableCell>
              <Text>{pool?.machineType}</Text>
            </TableCell>
            <TableCell>
              <Text>{pool?.autoScalerMin}</Text>
            </TableCell>
            <TableCell>
              <Text>{pool?.autoScalerMax}</Text>
            </TableCell>
            <TableCell>
              <Text>
                {hasHaZones(pool?.haZones)
                  ? t('common.labels.yes')
                  : t('common.labels.no')}
              </Text>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </Card>
  );
}
