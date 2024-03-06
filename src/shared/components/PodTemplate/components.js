import { useTranslation } from 'react-i18next';
import { getPorts } from '../GetContainersPorts';
import { useUrl } from 'hooks/useUrl';
import {
  List,
  Label,
  GroupHeaderListItem,
  Table as UI5Table,
  TableColumn,
  TableRow,
  TableCell,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { Labels } from '../Labels/Labels';
import { PodTemplateRow } from './PodTemplateRow';
import { Link } from '../Link/Link';

function Table({ items, columns, rowRenderer }) {
  if (!items?.length) {
    return <></>;
  }

  return (
    <UI5Table
      columns={columns.map(column => (
        <TableColumn style={{ width: '50%' }}>
          <Title level="H5">{column}</Title>
        </TableColumn>
      ))}
    >
      {items.map(item => (
        <TableRow>{rowRenderer(item)}</TableRow>
      ))}
    </UI5Table>
  );
}

export function ContainersPanel({ title, containers }) {
  return (
    <List headerText={title}>
      {containers?.map(container => (
        <ContainerComponent key={container.name} container={container} />
      ))}
    </List>
  );
}

function ContainerComponent({ container }) {
  const { t } = useTranslation();

  return (
    <>
      <GroupHeaderListItem>{container.name}</GroupHeaderListItem>
      <PodTemplateRow
        label={t('pods.labels.image')}
        component={
          <Text
            style={{
              overflow: 'hidden',
            }}
          >
            {container.image}
          </Text>
        }
      />
      <PodTemplateRow
        label={t('pods.labels.image-pull-policy')}
        component={<Text>{container.imagePullPolicy || 'Always'}</Text>}
      />
      <PodTemplateRow
        label={t('pods.labels.ports')}
        component={<Text>{getPorts(container.ports)}</Text>}
      />
      {container.env && (
        <PodTemplateRow
          label={t('pods.labels.env')}
          component={
            <Table
              items={container.env}
              columns={[t('common.headers.name'), t('common.headers.value')]}
              rowRenderer={env => (
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
        <PodTemplateRow
          label={t('pods.labels.volume-mounts')}
          component={
            <Table
              items={container.volumeMounts}
              columns={[t('common.headers.name'), t('pods.labels.mount-path')]}
              rowRenderer={mount => (
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
        <PodTemplateRow
          label={t('pods.labels.command')}
          component={
            <p className="code-block">{container.command.join(' ')}</p>
          }
        />
      )}
      {container.args && (
        <PodTemplateRow
          label={t('pods.labels.args')}
          component={<p className="code-block">{container.args.join(' ')}</p>}
        />
      )}
    </>
  );
}

export function VolumesPanel({ title, labels, volumes }) {
  const { t } = useTranslation();
  return (
    <List headerText={title}>
      <PodTemplateRow
        label={t('common.headers.labels')}
        component={<Labels labels={labels} />}
      />
      {volumes.map(volume => (
        <VolumeComponent key={volume.name} volume={volume} />
      ))}
    </List>
  );
}

function VolumeComponent({ volume }) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();
  const { name, configMap, secret } = volume;

  const getTypeLabel = () => {
    switch (true) {
      case !!configMap:
        return t('config-maps.name_singular');
      case !!secret:
        return t('secrets.name_singular');
      default:
        const volumeType = Object.keys(volume).find(key => key !== 'name');
        return volumeType;
    }
  };

  const typeLabel = getTypeLabel();
  const k8sResource = configMap || secret;
  const k8sResourceName = configMap?.name || secret?.secretName;

  return (
    <>
      <GroupHeaderListItem>{name}</GroupHeaderListItem>
      <PodTemplateRow label="Type" component={<Text>{typeLabel}</Text>} />
      {k8sResource && (
        <PodTemplateRow
          label={t('common.headers.resource')}
          component={
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
        <PodTemplateRow
          label={t('common.headers.items')}
          component={
            <Table
              items={k8sResource.items}
              columns={[t('common.headers.key'), t('common.labels.path')]}
              rowRenderer={mount => (
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
