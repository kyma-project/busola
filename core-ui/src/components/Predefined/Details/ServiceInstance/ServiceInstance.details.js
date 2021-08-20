import React from 'react';
import { ServiceInstanceStatus } from 'shared/components/ServiceInstanceStatus';
import { ServiceBindingList } from './ServiceBindingList';
import { ServiceInstanceData } from './ServiceInstanceData';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

export const ServiceInstancesDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const ServiceInstanceParameters = ({ spec }) => {
    if (!spec.parameters) return;

    return (
      <ReadonlyEditorPanel
        title="Instance Parameters"
        value={JSON.stringify(spec.parameters, null, 2)}
        key="instance-parameters"
        editorProps={{ language: 'json', height: '10em' }}
      />
    );
  };

  const customColumns = [
    {
      header: 'Status',
      value: resource => <ServiceInstanceStatus serviceInstance={resource} />,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[
        ServiceInstanceData,
        ServiceBindingList,
        ServiceInstanceParameters,
      ]}
      {...otherParams}
    />
  );
};
