export const statusColor = (statusType) => {
  switch (statusType) {
    case 'PROVISIONING':
    case 'DEPROVISIONING':
    case 'PENDING':
      return '#ffb600';
    case 'FAILED':
      return '#ee0000';
    case 'RUNNING':
      return '#3db350';
    default:
      return '#ffb600';
  }
};