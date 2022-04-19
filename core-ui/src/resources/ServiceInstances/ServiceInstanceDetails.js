import React from 'react';
import { useTranslation } from 'react-i18next';

import { BTPResourceStatus } from 'shared/components/BTPResourceStatus';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { ServiceBindingList } from './ServiceBindingList';
import { ServiceInstanceData } from './ServiceInstanceData';
import { ServiceInstanceCreate } from './ServiceInstanceCreate';

export function ServiceInstanceDetails(props) {
  const { t } = useTranslation();

  const ServiceInstanceParameters = ({ spec }) => {
    if (!spec.parameters) return;

    return (
      <ReadonlyEditorPanel
        title={t('btp-instances.parameters')}
        value={JSON.stringify(spec.parameters, null, 2)}
        key="instance-parameters"
        editorProps={{ language: 'json', height: '10em' }}
      />
    );
  };

  const customColumns = [
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
        ServiceInstanceData,
        ServiceBindingList,
        ServiceInstanceParameters,
      ]}
      createResourceForm={ServiceInstanceCreate}
      {...props}
    />
  );
}

export default ServiceInstanceDetails;
