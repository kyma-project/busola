import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '@ui5/webcomponents-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { ContainerStatus } from './ContainerStatus';
import { getPorts } from 'shared/components/GetContainersPorts';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { ReadableElapsedTimeFromNow } from 'shared/components/ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';

import { useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';

ContainersData.propTypes = {
  containers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default function ContainersData({ type, containers, statuses }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setLayout = useSetRecoilState(columnLayoutState);

  if (!containers) {
    return null;
  }

  const ContainerComponent = ({ container, status }) => {
    const state =
      status?.state?.running ||
      status?.state?.waiting ||
      status?.state?.terminated;
    return (
      <UI5Panel
        disableMargin
        title={container.name}
        headerActions={
          <Button
            aria-label={'view-logs-for-' + container.name}
            onClick={() => {
              setLayout({
                midColumn: null,
                endColumn: null,
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
        }
      >
        <LayoutPanelRow
          name={t('common.headers.status')}
          value={<ContainerStatus status={status} />}
        />
        <LayoutPanelRow
          name={t('common.headers.started-at')}
          value={
            <ReadableElapsedTimeFromNow
              timestamp={state?.startedAt}
              valueUnit={t('common.value-units.days-ago')}
            />
          }
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
      </UI5Panel>
    );
  };

  return (
    <UI5Panel title={type}>
      {containers.map(container => (
        <ContainerComponent
          key={container.name}
          container={container}
          status={statuses?.find(status => status.name === container.name)}
        />
      ))}
    </UI5Panel>
  );
}
