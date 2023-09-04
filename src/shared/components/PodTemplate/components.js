import { LayoutPanelRow } from '../LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';
import { getPorts } from '../GetContainersPorts';
import { Link } from 'react-router-dom';
import { useUrl } from 'hooks/useUrl';
import { Panel, Title, Toolbar } from '@ui5/webcomponents-react';

function Table({ items, headers, rowRenderer }) {
  if (!items?.length) {
    return null;
  }

  return (
    <table className="template-table">
      <thead>
        <tr>
          {headers.map(header => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          return <tr key={i}>{rowRenderer(item)}</tr>;
        })}
      </tbody>
    </table>
  );
}

function ContainerComponent({ container }) {
  const { t } = useTranslation();

  return (
    <Panel
      fixed
      header={
        <Toolbar>
          <Title level="H5">{container.name}</Title>
        </Toolbar>
      }
    >
      <LayoutPanelRow name={t('pods.labels.image')} value={container.image} />
      <LayoutPanelRow
        name={t('pods.labels.image-pull-policy')}
        value={container.imagePullPolicy || 'Always'}
      />
      <LayoutPanelRow
        name={t('pods.labels.ports')}
        value={getPorts(container.ports)}
      />
      {container.env && (
        <LayoutPanelRow
          name={t('pods.labels.env')}
          value={
            <Table
              items={container.env}
              headers={[t('common.headers.name'), t('common.headers.value')]}
              rowRenderer={env => (
                <>
                  <td>{env.name}</td>
                  <td>
                    {env.value || env?.valueFrom?.secretKeyRef?.name || ''}
                  </td>
                </>
              )}
            />
          }
        />
      )}
      {container.volumeMounts && (
        <LayoutPanelRow
          name={t('pods.labels.volume-mounts')}
          value={
            <Table
              items={container.volumeMounts}
              headers={[t('common.headers.name'), t('pods.labels.mount-path')]}
              rowRenderer={mount => (
                <>
                  <td>{mount.name}</td>
                  <td>{mount?.mountPath}</td>
                </>
              )}
            />
          }
        />
      )}
      {container.command && (
        <LayoutPanelRow
          name={t('pods.labels.command')}
          value={<p className="code-block">{container.command.join(' ')}</p>}
        />
      )}
      {container.args && (
        <LayoutPanelRow
          name={t('pods.labels.args')}
          value={<p className="code-block">{container.args.join(' ')}</p>}
        />
      )}
    </Panel>
  );
}

export function ContainersPanel({ title, containers }) {
  return (
    <>
      <Panel
        fixed
        className="fd-margin--md"
        header={
          <Toolbar>
            <Title level="H5">{title}</Title>
          </Toolbar>
        }
      >
        {containers?.map(container => (
          <ContainerComponent key={container.name} container={container} />
        ))}
      </Panel>
    </>
  );
}

export function Volume({ volume }) {
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
    <Panel
      fixed
      header={
        <Toolbar>
          <Title level="H5">{name}</Title>
        </Toolbar>
      }
    >
      <LayoutPanelRow name="Type" value={typeLabel} />
      {k8sResource && (
        <LayoutPanelRow
          name={t('common.headers.resource')}
          value={
            <Link
              className="fd-link"
              to={namespaceUrl(
                `${configMap ? 'configmaps' : 'secrets'}/${k8sResourceName}`,
              )}
            >
              {k8sResourceName}
            </Link>
          }
        />
      )}
      {k8sResource?.items && (
        <LayoutPanelRow
          name={t('common.headers.items')}
          value={
            <Table
              items={k8sResource.items}
              headers={[t('common.headers.key'), t('common.labels.path')]}
              rowRenderer={mount => (
                <>
                  <td>{mount.key}</td>
                  <td>{mount.path}</td>
                </>
              )}
            />
          }
        />
      )}
    </Panel>
  );
}
