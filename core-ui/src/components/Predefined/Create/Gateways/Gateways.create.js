import React from 'react';
import { CreateGatewayForm } from './CreateGatewayForm';

export function GatewaysCreate(props) {
  return <CreateGatewayForm namespaceId={props.namespace} {...props} />;
}
