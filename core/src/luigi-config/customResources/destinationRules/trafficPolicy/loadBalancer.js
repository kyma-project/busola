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
  visibility: "$consistentHashSelector = 'httpCookie'",
  children: [{ path: 'name' }, { path: 'path' }, { path: 'ttl' }],
};

const consistentHash = {
  widget: 'FormGroup',
  path: 'consistentHash',
  // visibility: "$loadBalancerSelector = 'consistentHash'"
  children: [
    // TODO
    // {
    //   var: 'consistentHashSelector',
    //   name: 'chooseConsistentHashSelector',
    //   type: 'string',
    //   enum: [
    //     'httpHeaderName',
    //     'httpCookie',
    //     'useSourceIp',
    //     'httpQueryParameterName',
    //   ],
    // },
    {
      path: 'httpHeaderName',
      visibility: "$consistentHashSelector = 'httpHeaderName'",
    },
    httpCookie,
    {
      path: 'useSourceIp',
      visibility: "$consistentHashSelector = 'useSourceIp'",
    },
    {
      path: 'httpQueryParameterName',
      visibility: "$consistentHashSelector = 'httpQueryParameterName'",
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
    //TODO simple or consistnetHash
    // {
    //   var: 'loadBalancerSelector',
    //   name: 'chooseLoadBalancerSelector',
    //   type: 'string',
    //   enum: [
    //     'simple',
    //     'consistentHash'
    //   ],
    // },
    {
      path: 'simple',
      // visibility: "$loadBalancerSelector = 'simple'"
    },
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
