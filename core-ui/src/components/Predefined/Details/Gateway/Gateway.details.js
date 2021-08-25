import React from 'react';

import { GatewayServers } from './GatewayServers';

export function GatewaysDetails({ DefaultRenderer, ...otherParams }) {
  return (
    <DefaultRenderer
      customComponents={[GatewayServers]}
      {...otherParams}
    ></DefaultRenderer>
  );
}
