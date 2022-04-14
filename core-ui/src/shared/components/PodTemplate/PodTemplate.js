import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { getPorts } from '../GetContainersPorts';

import './PodTemplate.scss';

function getEnvs(envs) {
  if (envs?.length) {
    return (
      <table className="env-table">
        <tr className="table-header">
          <th>Name</th>
          <th>Value</th>
        </tr>
        {envs.map(env => {
          return (
            <tr>
              <td>{env.name}</td>
              <td>{env.value}</td>
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

  const ContainerComponent = ({ container, name }) => (
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
          <LayoutPanelRow name={'Enviroment'} value={getEnvs(container.env)} />
        )}
        {container.volume && (
          <LayoutPanelRow name={'Volume Mounts'} value={'Mount'} />
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
        <LayoutPanel.Head title={'Pod template'} />
      </LayoutPanel.Header>
      {template.spec.containers && (
        <>
          <LayoutPanel className="fd-margin--md">
            <LayoutPanel.Header>
              <LayoutPanel.Head title={'Containers'} />
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              {template.spec.containers.map(container => (
                <ContainerComponent
                  key={container.name}
                  container={container}
                  name="Containers"
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
              <LayoutPanel.Head title={'Init containers'} />
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              {template.spec.initContainers.map(container => (
                <ContainerComponent
                  key={container.name}
                  container={container}
                  name="Init Conatiners"
                />
              ))}
            </LayoutPanel.Body>
          </LayoutPanel>
        </>
      )}
    </LayoutPanel>
  );
}
