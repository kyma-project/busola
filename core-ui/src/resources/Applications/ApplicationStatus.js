import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

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
  const statusDescription = application.status?.installationStatus?.description;

  return (
    <StatusBadge
      additionalContent={statusDescription}
      type={statusType}
      resourceKind="applications"
    >
      {status}
    </StatusBadge>
  );
}
