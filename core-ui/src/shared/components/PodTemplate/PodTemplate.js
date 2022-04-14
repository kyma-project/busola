import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { getPorts } from '../GetContainersPorts';

import './PodTemplate.scss';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

function getEnvs(envs) {
  if (envs?.length) {
    return (
      <table className="template-table">
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
        {envs.map(env => {
          return (
            <tr>
              <td>{env.name || EMPTY_TEXT_PLACEHOLDER}</td>
              <td>
                {env.value ||
                  env?.valueFrom?.secretKeyRef?.name ||
                  EMPTY_TEXT_PLACEHOLDER}
              </td>
            </tr>
          );
        })}
      </table>
    );
  } else {
    return '';
  }
}

function getMounts(mounts) {
  if (mounts?.length) {
    return (
      <table className="template-table">
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
        {mounts.map(mount => {
          return (
            <tr>
              <td>{mount.name}</td>
              <td>{mount?.mountPath || EMPTY_TEXT_PLACEHOLDER}</td>
            </tr>
          );
        })}
      </table>
    );
  } else {
    return '';
  }
}

export function PodTemplate({ template }) {
  const { t } = useTranslation();

  const ContainerComponent = ({ container }) => (
    <>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={container.name} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {container.image && (
          <LayoutPanelRow
            name={t('pods.labels.image')}
            value={container.image}
          />
        )}
        {container.imagePullPolicy && (
          <LayoutPanelRow
            name={t('pods.labels.image-pull-policy')}
            value={container.imagePullPolicy}
          />
        )}
        {container.ports && (
          <LayoutPanelRow
            name={t('pods.labels.ports')}
            value={getPorts(container.ports)}
          />
        )}
        {container.env && (
          <LayoutPanelRow
            name={t('pods.labels.env')}
            value={getEnvs(container.env)}
          />
        )}
        {container.volumeMounts && (
          <LayoutPanelRow
            name={t('pods.labels.volume-mounts')}
            value={getMounts(container.volumeMounts)}
          />
        )}
      </LayoutPanel.Body>
    </>
  );

  if (!template.spec.containers && !template.spec.initContainers) {
    return null;
  }

  return (
    <LayoutPanel className="fd-margin--md" key="pod-template">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('deployments.headers.pod-template')} />
      </LayoutPanel.Header>
      {template.spec.containers && (
        <>
          <LayoutPanel className="fd-margin--md">
            <LayoutPanel.Header>
              <LayoutPanel.Head title={t('pods.labels.constainers')} />
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              {template.spec.containers.map(container => (
                <ContainerComponent
                  key={container.name}
                  container={container}
                />
              ))}
            </LayoutPanel.Body>
          </LayoutPanel>
        </>
      )}
      {template.spec.initContainers && (
        <>
          <LayoutPanel className="fd-margin--md">
            <LayoutPanel.Header>
              <LayoutPanel.Head title={t('pods.labels.init-constainers')} />
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              {template.spec.initContainers.map(container => (
                <ContainerComponent
                  key={container.name}
                  container={container}
                />
              ))}
            </LayoutPanel.Body>
          </LayoutPanel>
        </>
      )}
    </LayoutPanel>
  );
}
