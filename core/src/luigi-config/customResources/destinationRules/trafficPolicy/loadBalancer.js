const localityLoadBalancer = {
  path: 'localityLbSetting',
  widget: 'FormGroup',
  children: [
    { path: 'enabled', type: 'boolean' },
    {
      path: 'distribute',
      widget: 'GenericList',
    },
    {
      path: 'distribute[].from',
    },
    {
      path: 'distribute[].to',
      widget: 'KeyValuePair',
    },
    {
      path: 'failover',
      widget: 'GenericList',
    },
    {
      path: 'failover[].from',
    },
    {
      path: 'failover[].to',
    },
    { path: 'failoverPriority', widget: 'SimpleList' },
  ],
};

const httpCookie = {
  path: 'httpCookie',
  widget: 'FormGroup',
  children: [{ path: 'name' }, { path: 'path' }, { path: 'ttl' }],
};

//TODO
const consistentHashSelector = {
  path: 'consistentHashSelector',
  enum: [
    'httpHeaderName',
    'httpCookie',
    'useSourceIp',
    'httpQueryParameterName',
    'minimumRingSize-WEB',
  ],
};
const consistentHash = {
  widget: 'FormGroup',
  path: 'consistentHash',
  children: [
    {
      path: 'httpHeaderName',
    },
    httpCookie,
    {
      path: 'useSourceIp',
    },
    {
      path: 'httpQueryParameterName',
    },
    {
      path: 'minimumRingSize',
    },
  ],
};

export const loadBalancer = {
  widget: 'FormGroup',
  path: 'loadBalancer',
  children: [
    {
      path: 'simple',
    },
    // consistentHashSelector,
    consistentHash,
    localityLoadBalancer,
    {
      path: 'warmupDurationSecs',
    },
  ],
};

const loadBalancerGenericListSyntax = { ...loadBalancer };
loadBalancerGenericListSyntax.path = '[].loadBalancer';
export { loadBalancerGenericListSyntax };
