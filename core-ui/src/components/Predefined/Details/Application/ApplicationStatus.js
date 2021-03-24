import React from 'react';
import { StatusBadge } from 'react-shared';

const isStatusOk = application => {
  return application.status?.installationStatus?.status === 'deployed';
};
const isStatusEmpty = application => !application.status;

const getStatus = application => {
  if (isStatusEmpty(application)) return 'provisioning';
  return isStatusOk(application) ? 'deployed' : 'error';
};

const getStatusType = application => {
  if (isStatusEmpty(application)) return 'warning';
  return isStatusOk(application) ? 'success' : 'error';
};

export function ApplicationStatus({ application }) {
  const status = getStatus(application);
  const statusType = getStatusType(application);
  return <StatusBadge type={statusType}>{status}</StatusBadge>;
}
