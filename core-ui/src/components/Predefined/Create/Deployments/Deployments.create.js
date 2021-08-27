import React from 'react';
import { CreateDeploymentForm } from './CreateDeploymentForm';

export function DeploymentsCreate(props) {
  return <CreateDeploymentForm namespaceId={props.namespace} {...props} />;
}
