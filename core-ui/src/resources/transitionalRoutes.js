import React from 'react';

//namespaced
import eventsNamespace from './namespaceResources/eventsNamespace.routes';
import addonsConfigurationNamespace from './namespaceResources/addonsConfigurationNamespace.routes';

//cluster
import eventsCluster from './clusterResources/eventsCluster.routes';
import addonsConfigurationCluster from './clusterResources/addonsConfigurationCluster.routes';

const resources = (
  <>
    {/* namespace resources*/}
    {eventsNamespace}
    <>
      {/* configuration */}
      {addonsConfigurationNamespace}
    </>

    {/* cluster resources */}
    <>
      {eventsCluster}
      {addonsConfigurationCluster}
    </>
  </>
);

export default resources;
