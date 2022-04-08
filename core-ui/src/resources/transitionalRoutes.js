import React from 'react';

//namespaced
import eventsNamespace from './namespaceResources/eventsNamespace.routes';

//cluster
import eventsCluster from './clusterResources/eventsCluster.routes';

const resources = (
  <>
    {eventsNamespace}
    {eventsCluster}
  </>
);

export default resources;
