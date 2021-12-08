import React from 'react';
import { BTPResourceStatus } from 'shared/components/BTPResourceStatus';
import { ServiceBindingList } from './ServiceBindingList';
import { ServiceInstanceData } from './ServiceInstanceData';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { useTranslation } from 'react-i18next';

export const ServiceInstancesDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
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
