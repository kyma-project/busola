import React from 'react';
import CreateWorkloadForm from '../Details/Namespace/CreateWorkloadForm/CreateWorkloadForm';

export function DeploymentsCreate(props) {
  return <CreateWorkloadForm namespaceId={props.namespace} {...props} />;
}
