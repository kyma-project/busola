import { loadBalancerGenericListSyntax } from './loadBalancer';
import { connectionPoolGenericListSyntax } from './connectionPool';
import { outlierDetectionGenericListSyntax } from './outlierDetection';
import { tlsGenericListSyntax } from './tls';

export const portLevelSettings = {
  path: 'portLevelSettings',
  name: 'Port Level Settings',
  widget: 'GenericList',
  children: [
    { path: '[].port.number', name: 'Port Number' },
    loadBalancerGenericListSyntax,
    connectionPoolGenericListSyntax,
    outlierDetectionGenericListSyntax,
    tlsGenericListSyntax,
  ],
};
