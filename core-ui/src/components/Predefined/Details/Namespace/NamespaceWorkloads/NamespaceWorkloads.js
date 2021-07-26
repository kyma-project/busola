import React from 'react';
import LuigiClient from '@luigi-project/client';
import PropTypes from 'prop-types';

import { LayoutPanel, Icon } from 'fundamental-react';
import { useGetList, Spinner, CircleProgress } from 'react-shared';
import { useTranslation } from 'react-i18next';

import {
  getHealthyStatusesCount,
  getHealthyReplicasCount,
} from './NamespaceWorkloadsHelpers';

NamespaceWorkloads.propTypes = { namespace: PropTypes.string.isRequired };

const navigateTo = path => () => {
  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(path);
};

const ResourceCircle = ({
  data,
  counter,
  loading,
  error,
  title,
  color,
  onClick,
}) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <p>
        {t('namespaces.overview.workloads.error', {
          title,
          message: error.message,
        })}
      </p>
    );
  } else if (loading || !data) {
    return <Spinner />;
  }
  return (
    <CircleProgress
      onClick={onClick}
      color={color}
      value={counter(data)}
      max={data.length}
      title={title}
    />
  );
};

const PodsCircle = ({ namespace }) => {
  const { t } = useTranslation();
  const { data, error, loading = true } = useGetList()(
    `/api/v1/namespaces/${namespace}/pods`,
    {
      pollingInterval: 3100,
    },
  );
  return (
    <ResourceCircle
      onClick={navigateTo('pods')}
      data={data}
      counter={getHealthyStatusesCount}
      loading={loading}
      error={error}
      title={t('namespaces.overview.workloads.pods')}
      color="var(--sapIndicationColor_5)"
    />
  );
};

const DeploymentsCircle = ({ namespace }) => {
  const { t } = useTranslation();
  const { data, error, loading = true } = useGetList()(
    `/apis/apps/v1/namespaces/${namespace}/deployments`,
    {
      pollingInterval: 3200,
    },
  );
  return (
    <ResourceCircle
      onClick={navigateTo('deployments')}
      data={data}
      counter={getHealthyReplicasCount}
      loading={loading}
      error={error}
      title={t('namespaces.overview.workloads.deployments')}
      color="var(--sapIndicationColor_6)"
    />
  );
};

export function NamespaceWorkloads({ namespace }) {
  const { t } = useTranslation();
  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <Icon
          size="m"
          className="fd-margin-end--sm"
          glyph="stethoscope"
          ariaLabel="Health icon"
        />
        <LayoutPanel.Head title={t('namespaces.overview.workloads.title')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body className="namespace-workloads__body">
        <PodsCircle namespace={namespace} />
        <DeploymentsCircle namespace={namespace} />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
