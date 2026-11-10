import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  Button,
  FormGroup,
  Title,
  Toolbar,
  ToolbarSpacer,
} from '@ui5/webcomponents-react';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { ContainerStatus } from './ContainerStatus';
import { getPorts, PortsType } from 'shared/components/GetContainersPorts';
import { ReadableElapsedTimeFromNow } from 'shared/components/ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';

import { useSetAtom } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';

import './ContainersData.scss';

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

  return (
    <UI5Card title={type} accessibleName={`${type} panel`}>
      <ResourceDetailsForm>
        {containers.map((container) => {
          const status = statuses?.find(
            (status) => status.name === container.name,
          ) ?? { name: '', state: {} };
          const state =
            status.state?.running ||
            status.state?.waiting ||
            status.state?.terminated;

          return (
            <FormGroup key={container.name} accessibleName={container.name}>
              {/* The heading holds a button, so it can't be the group's headerText. */}
              <Toolbar className="container-group-heading">
                <Title level="H6" size="H6">
                  {container.name}
                </Title>
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
              </Toolbar>
              <ResourceDetailsFormItem
                label={t('common.headers.status')}
                value={<ContainerStatus status={status} />}
              />
              <ResourceDetailsFormItem
                label={t('common.headers.started-at')}
                value={
                  <ReadableElapsedTimeFromNow timestamp={state?.startedAt} />
                }
              />
              {container.image && (
                <ResourceDetailsFormItem
                  label={t('pods.labels.image')}
                  value={container.image}
                />
              )}
              {container.imagePullPolicy && (
                <ResourceDetailsFormItem
                  label={t('pods.labels.image-pull-policy')}
                  value={container.imagePullPolicy}
                />
              )}
              {container.ports && (
                <ResourceDetailsFormItem
                  label={t('pods.labels.ports')}
                  value={getPorts(container.ports)}
                />
              )}
            </FormGroup>
          );
        })}
      </ResourceDetailsForm>
    </UI5Card>
  );
}
