import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  Button,
  Title,
  Toolbar,
  ToolbarSpacer,
} from '@ui5/webcomponents-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { ContainerStatus } from './ContainerStatus';
import { getPorts, PortsType } from 'shared/components/GetContainersPorts';
import { ReadableElapsedTimeFromNow } from 'shared/components/ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';

import { useSetAtom } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';

type ContainerType = {
  name: string;
  image: string;
  imagePullPolicy: string;
  ports: PortsType[];
};

type StatusType = {
  name: string;
  state: Record<string, any>;
};

interface ContainersDataProps {
  type: string;
  containers: ContainerType[];
  statuses: StatusType[];
}

export default function ContainersData({
  type,
  containers,
  statuses,
}: ContainersDataProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setLayout = useSetAtom(columnLayoutAtom);

  if (!containers) {
    return null;
  }

  const ContainerComponent = ({
    container,
    status,
  }: {
    container: ContainerType;
    status: StatusType;
  }) => {
    const state =
      status?.state?.running ||
      status?.state?.waiting ||
      status?.state?.terminated;
    return (
      <>
        <Toolbar>
          <Title level="H6" size="H6" className="sap-margin-begin-tiny">
            {container.name}
          </Title>
          <>
            <ToolbarSpacer />
            <Button
              accessibleName={'view-logs-for-' + container.name}
              onClick={() => {
                setLayout({
                  midColumn: null,
                  endColumn: null,
                  startColumn: null,
                  layout: 'OneColumn',
                });
                navigate(
                  `${window.location.pathname.replace(
                    window.location.search,
                    '',
                  )}/containers/${container.name}`,
                );
              }}
            >
              {t('pods.buttons.view-logs')}
            </Button>
          </>
        </Toolbar>

        <LayoutPanelRow
          name={t('common.headers.status')}
          value={<ContainerStatus status={status} />}
        />
        <LayoutPanelRow
          name={t('common.headers.started-at')}
          value={<ReadableElapsedTimeFromNow timestamp={state?.startedAt} />}
        />
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
      </>
    );
  };

  return (
    <UI5Card title={type} accessibleName={`${type} panel`}>
      {containers.map((container) => (
        <ContainerComponent
          key={container.name}
          container={container}
          status={
            statuses?.find((status) => status.name === container.name) ?? {
              name: '',
              state: {},
            }
          }
        />
      ))}
    </UI5Card>
  );
}
