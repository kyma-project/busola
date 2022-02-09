import React from 'react';
import { useMicrofrontendContext } from 'react-shared';

export function YamlSend({ yamlContent }) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const filteredResources = yamlContent?.filter(resource => resource !== null);

  const urls = filteredResources?.map(resource => ({
    name: resource?.metadata?.name,
    url: `${resource?.apiVersion === 'v1' ? 'api' : 'apis'}/${
      resource?.apiVersion
    }/namespaces/${resource?.metadata?.namespace ||
      namespace}/${resource?.kind?.toLowerCase()}s`, // fix namespace, fix s
  }));

  return (
    <>
      You will create {filteredResources?.length || 0} resources:
      {filteredResources?.map(resource => (
        <p key={`${resource?.kind}-${resource?.metadata?.name}`}>
          {resource?.kind} {resource?.metadata?.name}
        </p>
      ))}
    </>
  );
}
