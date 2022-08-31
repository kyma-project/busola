const localityLoadBalancer = {
  path: 'localityLbSetting',
  name: 'Locality LB Settings',
  widget: 'FormGroup',
  children: [
    { path: 'enabled', name: 'Enabled', type: 'boolean' },
    //todo one of distribute // failover
    {
      path: 'distribute',
      name: 'Distribute',
      widget: 'GenericList',
    },
    {
      path: 'distribute[].from',
      name: 'From',
    },
    {
      path: 'distribute[].to',
      name: 'To',
      widget: 'KeyValuePair',
      valueType: 'number',
    },
    {
      path: 'failover',
      name: 'Failover',
      widget: 'GenericList',
    },
    {
      path: 'failover[].from',
      name: 'From',
    },
    {
      path: 'failover[].to',
      name: 'To',
    },
    {
      path: 'failoverPriority',
      name: 'Failover Priority',
      widget: 'SimpleList',
    },
  ],
};

const httpCookie = {
  path: 'httpCookie',
  name: 'HTTP Cookie',
  widget: 'FormGroup',
  // visibility: "$consistentHashSelector = 'httpCookie'",
  children: [
    { path: 'name', name: 'Name' },
    { path: 'path', name: 'Path' },
    { path: 'ttl', name: 'TTL' },
  ],
};

const consistentHash = {
  widget: 'FormGroup',
  path: 'consistentHash',
  name: 'Consistent Hash',
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
      name: 'HTTP Header Name',
      // visibility: "$consistentHashSelector = 'httpHeaderName'",
    },
    httpCookie,
    {
      path: 'useSourceIp',
      name: 'Use Source IP',
      // visibility: "$consistentHashSelector = 'useSourceIp'",
    },
    {
      path: 'httpQueryParameterName',
      name: 'HTTP Query Parameter Name',
      // visibility: "$consistentHashSelector = 'httpQueryParameterName'",
    },
    {
      path: 'minimumRingSize',
      name: 'Minimum Ring Size',
    },
  ],
};

export const loadBalancer = {
  widget: 'FormGroup',
  path: 'loadBalancer',
  name: 'Load Balancer',
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
      name: 'Simple',
      // visibility: "$loadBalancerSelector = 'simple'"
    },
    consistentHash,
    localityLoadBalancer,
    {
      path: 'warmupDurationSecs', //this is in the docs but not in the schema
      name: 'Warmup Duration Secs', //this is in the docs but not in the schema
    },
  ],
};

const loadBalancerGenericListSyntax = { ...loadBalancer };
loadBalancerGenericListSyntax.path = '[].loadBalancer';
export { loadBalancerGenericListSyntax };
