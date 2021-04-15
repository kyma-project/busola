import React from 'react';
import { InfoBadge } from 'fundamental-react';

const LambdaStatusBadge = ({ status }) => {
  let color;

  switch (status) {
    case 'Building':
    case 'Deploying':
    case 'Updating':
      return <InfoBadge>{status}</InfoBadge>;
    case 'Running':
      color = 8;
      break;
    case 'Unknown':
      color = 1;
      break;
    case 'Error':
      color = 2;
      break;
    default:
      color = 1;
  }

  return <InfoBadge color={color}>{status}</InfoBadge>;
};

export default LambdaStatusBadge;
