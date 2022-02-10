import React from 'react';

export function YamlResourcesList({ resourcesData }) {
  console.log('YamlResourcesList resources: ', resourcesData);
  const filteredResources = resourcesData?.filter(
    resource => resource !== null,
  );

  return (
    <div className="yaml-modal-resources">
      You will create {filteredResources?.length || 0} resources:
      {filteredResources?.map(r => (
        <>
          <p key={`${r?.value?.kind}-${r?.value?.name}`}>
            - {r?.value?.kind} {r?.value?.name} - {r?.status}
          </p>
          <p ey={`${r?.value?.kind}-${r?.value?.name}-message`}>{r?.message}</p>
        </>
      ))}
    </div>
  );
}
