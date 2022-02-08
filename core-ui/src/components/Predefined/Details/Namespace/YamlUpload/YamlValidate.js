import React from 'react';

export function YamlValidate({ yamlContent }) {
  const filteredResources = yamlContent?.filter(resource => resource !== null);

  return (
    <>
      You will create {filteredResources?.length || 0} resources:
      {filteredResources?.map(resource => (
        <p>
          {resource?.kind} {resource?.metadata?.name}
        </p>
      ))}
    </>
  );
}
