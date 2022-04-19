import { LayoutPanel, Link } from 'fundamental-react';
import { LayoutPanelRow } from '../LayoutPanelRow/LayoutPanelRow';
import { navigateToFixedPathResourceDetails } from 'shared/hooks/navigate';
import { useTranslation } from 'react-i18next';
import { getPorts } from '../GetContainersPorts';

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
    <>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={container.name} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
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
                headers={[
                  t('common.headers.name'),
                  t('pods.labels.mount-path'),
                ]}
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
      </LayoutPanel.Body>
    </>
  );
}

export function ContainersPanel({ title, containers }) {
  return (
    <>
      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={title} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          {containers.map(container => (
            <ContainerComponent key={container.name} container={container} />
          ))}
        </LayoutPanel.Body>
      </LayoutPanel>
    </>
  );
}

export function Volume({ volume }) {
  const { t } = useTranslation();
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
      <LayoutPanel.Header>
        <LayoutPanel.Head title={name} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow name="Type" value={typeLabel} />
        {k8sResource && (
          <LayoutPanelRow
            name={t('common.headers.resource')}
            value={
              <Link
                onClick={() =>
                  navigateToFixedPathResourceDetails(
                    configMap ? 'configmaps' : 'secrets',
                    k8sResourceName,
                  )
                }
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
      </LayoutPanel.Body>
    </>
  );
}
