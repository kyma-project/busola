import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { BTPResourceStatus } from 'shared/components/BTPResourceStatus';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { ServiceBindingData } from './ServiceBindingData';
import { ServiceBindingCreate } from './ServiceBindingCreate';

export function ServiceBindingDetails(props) {
  const { t } = useTranslation();

  const ServiceBindingParameters = ({ spec }) => {
    if (!spec.parameters) return;

    return (
      <ReadonlyEditorPanel
        title={t('btp-service-bindings.parameters')}
        value={JSON.stringify(spec.parameters, null, 2)}
        key="instance-binding-parameters"
        editorProps={{ language: 'json', height: '10em' }}
      />
    );
  };

  const ServiceBindingParametersFrom = ({ spec }) => {
    if (!spec.parametersFrom) return;

    return (
      <ReadonlyEditorPanel
        title={t('btp-service-bindings.parameters-from')}
        value={JSON.stringify(spec.parametersFrom, null, 2)}
        key="instance-binding-parameters-from"
        editorProps={{ language: 'json', height: '10em' }}
      />
    );
  };

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledBy ownerReferences={resource.metadata.ownerReferences} />
      ),
    },
    {
      header: t('common.headers.status'),
      value: resource => (
        <BTPResourceStatus
          status={resource.status}
          resourceKind="btp-instances"
        />
      ),
    },
  ];

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[
        ServiceBindingData,
        ServiceBindingParameters,
        ServiceBindingParametersFrom,
      ]}
      createResourceForm={ServiceBindingCreate}
      {...props}
    />
  );
}
export default ServiceBindingDetails;
