const localityLoadBalancer = ({ uniqueVarPrefix }) => ({
  path: 'localityLbSetting',
  name: 'Locality LB Settings',
  widget: 'FormGroup',
  children: [
    { path: 'enabled', name: 'Enabled', type: 'boolean' },
    {
      var: `${uniqueVarPrefix}LbSelector`,
      name: 'ChooseLbSelector',
      type: 'string',
      enum: ['distribute', 'failover'],
    },
    {
      path: 'distribute',
      name: 'Distribute',
      widget: 'GenericList',
      visibility: `$${uniqueVarPrefix}LbSelector  = 'distribute'`,
    },
    {
      path: 'distribute[].from',
      name: 'From',
    },
    {
      path: 'distribute[].to',
      name: 'To',
      widget: 'KeyValuePair',
      value: {
        type: 'number',
      },
    },
    {
      path: 'failover',
      name: 'Failover',
      widget: 'GenericList',
      visibility: `$${uniqueVarPrefix}LbSelector  = 'failover'`,
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
      visibility: `$${uniqueVarPrefix}LbSelector  = 'failover'`,
      widget: 'SimpleList',
    },
  ],
});

const httpCookie = ({ uniqueVarPrefix }) => ({
  path: 'httpCookie',
  name: 'HTTP Cookie',
  widget: 'FormGroup',
  visibility: `$${uniqueVarPrefix}consistentHashSelector  = 'httpCookie'`,
  children: [
    { path: 'name', name: 'Name', required: true },
    { path: 'path', name: 'Path' },
    { path: 'ttl', name: 'TTL', required: true },
  ],
});

const consistentHash = ({ uniqueVarPrefix }) => ({
  widget: 'FormGroup',
  path: 'consistentHash',
  name: 'Consistent Hash',
  visibility: `$${uniqueVarPrefix}loadBalancerSelector = 'consistentHash'`,
  children: [
    {
      var: `${uniqueVarPrefix}consistentHashSelector`,
      name: 'ChooseConsistentHashSelector',
      type: 'string',
      enum: [
        'httpHeaderName',
        'httpCookie',
        'useSourceIp',
        'httpQueryParameterName',
      ],
    },
    {
      path: 'httpHeaderName',
      name: 'HTTP Header Name',
      required: true,
      visibility: `$${uniqueVarPrefix}consistentHashSelector = 'httpHeaderName'`,
    },
    httpCookie({ uniqueVarPrefix }),
    {
      path: 'useSourceIp',
      name: 'Use Source IP',
      required: true,
      visibility: `$${uniqueVarPrefix}consistentHashSelector = 'useSourceIp'`,
    },
    {
      path: 'httpQueryParameterName',
      name: 'HTTP Query Parameter Name',
      required: true,
      visibility: `$${uniqueVarPrefix}consistentHashSelector= 'httpQueryParameterName'`,
    },
    {
      path: 'minimumRingSize',
      name: 'Minimum Ring Size',
    },
  ],
});

export const loadBalancer = ({ uniqueVarPrefix, isArray }) => ({
  widget: 'FormGroup',
  path: isArray ? '[].loadBalancer' : 'loadBalancer',
  name: 'Load Balancer',
  children: [
    {
      var: `${uniqueVarPrefix}loadBalancerSelector`,
      name: 'ChooseLoadBalancerSelector',
      type: 'string',
      enum: ['simple', 'consistentHash'],
    },
    {
      path: 'simple',
      name: 'Simple',
      required: true,
      visibility: `$${uniqueVarPrefix}loadBalancerSelector = 'simple'`,
    },
    consistentHash({ uniqueVarPrefix }),
    localityLoadBalancer({ uniqueVarPrefix }),
    {
      path: 'warmupDurationSecs', //this is in the docs but not in the schema
      name: 'Warmup Duration Secs', //this is in the docs but not in the schema
    },
  ],
});
