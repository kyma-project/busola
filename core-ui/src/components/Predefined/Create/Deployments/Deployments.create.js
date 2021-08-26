import React from 'react';
import PropTypes from 'prop-types';
import { CreateDeploymentForm } from './CreateDeploymentForm';

export function DeploymentsCreate(props) {
  return <CreateDeploymentForm namespaceId={props.namespace} {...props} />;
}
