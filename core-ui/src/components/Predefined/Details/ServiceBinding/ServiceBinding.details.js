import React from 'react';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ServiceBindingStatus } from '../../../../shared/components/ServiceBindingStatus';
import { ServiceBindingData } from './ServiceBindingData';

export const ServiceBindingsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const ServiceBindingParameters = ({ spec }) => {
    if (!spec.parameters) return;

    return (
      <ReadonlyEditorPanel
        title="Instance Binding Parameters"
        value={JSON.stringify(spec.parameters, null, 2)}
        key="instance-binding-parameters"
        editorProps={{ language: 'json', height: '10em' }}
      />
    );
  };

  const customColumns = [
    {
      header: 'Status',
      value: resource => <ServiceBindingStatus serviceBinding={resource} />,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[ServiceBindingData, ServiceBindingParameters]}
      {...otherParams}
    />
  );
};
