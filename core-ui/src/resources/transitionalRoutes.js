import React from 'react';

//namespaced
import eventsNamespace from './namespaceResources/eventsNamespace.routes';
import addonsConfigurationNamespace from './namespaceResources/addonsConfigurationNamespace.routes';
import subscriptions from './namespaceResources/subscriptions.routes';
import serviceAccounts from './namespaceResources/serviceAccounts.routes';
import gitRepositories from './namespaceResources/gitRepositories.routes';

//cluster
import applications from './clusterResources/applications.routes';
import storageClasses from './clusterResources/storageClases.routes';
import persistentVolumes from './clusterResources/persistentVolumes.routes';
import eventsCluster from './clusterResources/eventsCluster.routes';
import addonsConfigurationCluster from './clusterResources/addonsConfigurationCluster.routes';

const resources = (
  <>
    {/* namespace resources*/}
    {eventsNamespace}
    <>
      {/* configuration */}
      {addonsConfigurationNamespace}
      {subscriptions}
      {serviceAccounts}
      {gitRepositories}
    </>

    {/* cluster resources */}
    <>
      {applications}
      {eventsCluster}
      {storageClasses}
      {persistentVolumes}
      {addonsConfigurationCluster}
    </>
  </>
);

export default resources;
