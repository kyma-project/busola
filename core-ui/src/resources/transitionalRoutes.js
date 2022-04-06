import React from 'react';

//namespaced
import serviceInstances from './namespaceResources/serviceInstances.routes';
import serviceBrokers from './namespaceResources/serviceBrokers.routes';
import serviceBindings from './namespaceResources/serviceBindings.routes';
import secrets from './namespaceResources/secrets.routes';
import roles from './namespaceResources/roles.routes';
import roleBindings from './namespaceResources/roleBindings.routes';
import persistentVolumeClaims from './namespaceResources/persistentVolumeClaims.routes';
import oAuth2Clients from './namespaceResources/oAuth2Clients.routes';
import networkPolicies from './namespaceResources/networkPolicies.routes';
import issuers from './namespaceResources/issuers.routes';
import ingresses from './namespaceResources/ingresses.routes';
import eventsNamespace from './namespaceResources/eventsNamespace.routes';
import dnsProvider from './namespaceResources/dnsProviders.routes';
import dnsEntries from './namespaceResources/dnsEntries.routes';
import customResourcesDefinitionsNamespace from './namespaceResources/customResourceDefinitionsNs.routes';
import configMaps from './namespaceResources/configMaps.routes';
import certificates from './namespaceResources/certificates.routes';
import authorizationPolicies from './namespaceResources/authorizationPolicies.routes';
import apiRules from './namespaceResources/apiRules.routes';
import addonsConfigurationNamespace from './namespaceResources/addonsConfigurationNamespace.routes';
import subscriptions from './namespaceResources/subscriptions.routes';
import serviceAccounts from './namespaceResources/serviceAccounts.routes';
import gitRepositories from './namespaceResources/gitRepositories.routes';

//cluster
import applications from './clusterResources/applications.routes';
import clusterRoles from './clusterResources/clusterRoles.routes';
import storageClasses from './clusterResources/storageClases.routes';
import persistentVolumes from './clusterResources/persistentVolumes.routes';
import eventsCluster from './clusterResources/eventsCluster.routes';
import addonsConfigurationCluster from './clusterResources/addonsConfigurationCluster.routes';
import customResourceDefinitionsCl from './clusterResources/customResourceDefinitionsCl.routes';
import clusterRoleBindings from './clusterResources/clusterRoleBindings.routes';

const resources = (
  <>
    {/* namespace resources*/}
    {eventsNamespace}
    <>
      {/* istio */}
      {authorizationPolicies}
      {/* discovery and network */}
      {ingresses}
      {networkPolicies}
      {apiRules}
      {/* storage */}
      {persistentVolumeClaims}
      {/* service management */}
      {serviceInstances}
      {serviceBindings}
      {serviceBrokers}
      {/* configuration */}
      {secrets}
      {roles}
      {roleBindings}
      {oAuth2Clients}
      {issuers}
      {dnsProvider}
      {dnsEntries}
      {customResourcesDefinitionsNamespace}
      {configMaps}
      {certificates}
      {addonsConfigurationNamespace}
      {subscriptions}
      {serviceAccounts}
      {gitRepositories}
    </>

    {/* cluster resources */}
    <>
      {applications}
      {eventsCluster}
      {clusterRoles}
      {storageClasses}
      {persistentVolumes}
      {addonsConfigurationCluster}
      {customResourceDefinitionsCl}
      {clusterRoleBindings}
    </>
  </>
);

export default resources;
