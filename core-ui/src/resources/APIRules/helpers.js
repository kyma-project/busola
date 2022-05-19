import * as jp from 'jsonpath';
import accessStrategyTypes from 'components/ApiRules/accessStrategyTypes';

// hostname may contain optional namespace prefix ({namespace}/{hostname})
function removeNamespacePrefix(host) {
  return host.includes('/') ? host.split('/')[1] : host;
}

export function hasWildcard(host) {
  if (!host) return false;

  // namespace prefix may be also '*' (all namespaces), get rid of it
  return removeNamespacePrefix(host).includes('*');
}

// find gateway by name in format {namespace}/{name}
export function findGateway(gatewayStr, allGateways) {
  gatewayStr = gatewayStr.replace('.svc.cluster.local', '');
  const [gatewayName, gatewayNamespace] = (gatewayStr || '.').split('.');

  return (allGateways || []).find(
    ({ metadata }) =>
      metadata.name === gatewayName && metadata.namespace === gatewayNamespace,
  );
}

export function getGatewayHosts(gateway) {
  const filterUnique = (e, i, arr) => arr.indexOf(e) === i;

  return (gateway?.spec.servers.flatMap(s => s.hosts) || [])
    .map(removeNamespacePrefix)
    .filter(filterUnique);
}

export function validateAccessStrategy(accessStrategy) {
  if (!accessStrategy || !accessStrategyTypes[accessStrategy.handler])
    return false;

  const { config, handler } = accessStrategy;

  if (handler === 'jwt') {
    const { jwks_urls, trusted_issuers } = config || {};
    if (!jwks_urls?.length || !trusted_issuers?.length) return false;
    if (jwks_urls.length !== trusted_issuers.length) return false;

    return jwks_urls.every(jU => jU) && trusted_issuers.every(tI => tI);
  } else {
    return true;
  }
}

function validateRule(rule) {
  const areMethodsValid = rule?.methods?.length > 0;

  const accessStrategies = rule?.accessStrategies;
  const areAccessStrategiesValid =
    accessStrategies && accessStrategies.every(validateAccessStrategy);

  return areMethodsValid && areAccessStrategiesValid;
}

export function validateApiRule(apiRule) {
  const hasValidService =
    jp.value(apiRule, '$.spec.service.name') &&
    jp.value(apiRule, '$.spec.service.port');

  const rules = jp.value(apiRule, '$.spec.rules');
  const hasValidRules = rules && rules.every(validateRule);

  return hasValidService && hasValidRules;
}
