import { loadBalancerGenericListSyntax } from './loadBalancer';
import { connectionPoolGenericListSyntax } from './connectionPool';
import { outlierDetectionGenericListSyntax } from './outlierDetection';
import { tlsGenericListSyntax } from './tls';

export const portLevelSettings = {
  path: 'portLevelSettings',
  widget: 'GenericList',
  children: [
    { path: '[].port.number' },
    loadBalancerGenericListSyntax,
    connectionPoolGenericListSyntax,
    outlierDetectionGenericListSyntax,
    tlsGenericListSyntax,
  ],
};
