import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { getPorts } from '../GetContainersPorts';
import { useUrl } from 'hooks/useUrl';
import {
  Label,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  Title,
} from '@ui5/webcomponents-react';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { Link } from '../Link/Link';

interface PodTemplateTableProps {
  className?: string;
  items: any[];
  columns: string[];
  rowRenderer: (item: any) => JSX.Element;
}

function PodTemplateTable({
  className,
  items,
  columns,
  rowRenderer,
}: PodTemplateTableProps) {
  if (!items?.length) {
    return <></>;
  }

  return (
    <Table
      overflowMode="Popin"
      className={className}
      headerRow={
        <TableHeaderRow style={{ width: '50%' }}>
          {columns.map((column) => (
            <TableHeaderCell key={`header-${column}`} minWidth="8rem">
              <Title level="H5">{column}</Title>
            </TableHeaderCell>
          ))}
        </TableHeaderRow>
      }
    >
      {items.map((item, index) => (
        <TableRow
          key={`row-${item?.name || item?.containerName || ''}-${index}`}
        >
          {rowRenderer(item)}
        </TableRow>
      ))}
    </Table>
  );
}

interface ContainerFieldsProps {
  container: Record<string, any>;
}

export function ContainerFields({ container }: ContainerFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <ResourceDetailsFormItem
        label={t('pods.labels.image')}
        value={container.image}
      />
      <ResourceDetailsFormItem
        label={t('pods.labels.image-pull-policy')}
        value={container.imagePullPolicy || 'Always'}
      />
      <ResourceDetailsFormItem
        label={t('pods.labels.ports')}
        value={getPorts(container.ports)}
      />
      {container.env && (
        <ResourceDetailsFormItem
          label={t('pods.labels.env')}
          value={
            <PodTemplateTable
              className="card-shadow"
              items={container.env}
              columns={[t('common.headers.name'), t('common.headers.value')]}
              rowRenderer={(env) => (
                <>
                  <TableCell>
                    <Label>{env.name}</Label>
                  </TableCell>
                  <TableCell>
                    <Label>
                      {env.value || env?.valueFrom?.secretKeyRef?.name || ''}
                    </Label>
                  </TableCell>
                </>
              )}
            />
          }
        />
      )}
      {container.volumeMounts && (
        <ResourceDetailsFormItem
          label={t('pods.labels.volume-mounts')}
          value={
            <PodTemplateTable
              items={container.volumeMounts}
              columns={[t('common.headers.name'), t('pods.labels.mount-path')]}
              rowRenderer={(mount) => (
                <>
                  <TableCell>
                    <Label>{mount.name}</Label>
                  </TableCell>
                  <TableCell>
                    <Label>{mount?.mountPath}</Label>
                  </TableCell>
                </>
              )}
            />
          }
        />
      )}
      {container.command && (
        <ResourceDetailsFormItem
          label={t('pods.labels.command')}
          value={<p className="code-block">{container.command.join(' ')}</p>}
        />
      )}
      {container.args && (
        <ResourceDetailsFormItem
          label={t('pods.labels.args')}
          value={<p className="code-block">{container.args.join(' ')}</p>}
        />
      )}
    </>
  );
}

export function VolumeFields({ volume }: { volume: any }) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();
  const { configMap, secret } = volume;

  const getTypeLabel = () => {
    switch (true) {
      case !!configMap:
        return t('config-maps.name_singular');
      case !!secret:
        return t('secrets.name_singular');
      default: {
        const volumeType = Object.keys(volume).find((key) => key !== 'name');
        return volumeType;
      }
    }
  };

  const typeLabel = getTypeLabel();
  const k8sResource = configMap || secret;
  const k8sResourceName = configMap?.name || secret?.secretName;

  return (
    <>
      <ResourceDetailsFormItem
        label={t('common.labels.type')}
        value={typeLabel}
      />
      {k8sResource && (
        <ResourceDetailsFormItem
          label={t('common.headers.resource')}
          value={
            <Link
              url={namespaceUrl(
                `${configMap ? 'configmaps' : 'secrets'}/${k8sResourceName}`,
              )}
            >
              {k8sResourceName}
            </Link>
          }
        />
      )}
      {k8sResource?.items && (
        <ResourceDetailsFormItem
          label={t('common.headers.items')}
          value={
            <PodTemplateTable
              items={k8sResource.items}
              columns={[t('common.headers.key'), t('common.labels.path')]}
              rowRenderer={(mount) => (
                <>
                  <TableCell>
                    <Label>{mount.key}</Label>
                  </TableCell>
                  <TableCell>
                    <Label>{mount.path}</Label>
                  </TableCell>
                </>
              )}
            />
          }
        />
      )}
    </>
  );
}
