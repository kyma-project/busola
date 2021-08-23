import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { BTPResourceStatus } from 'shared/components/BTPResourceStatus';
import { ServiceBindingData } from './ServiceBindingData';

export const ServiceBindingsDetails = ({ DefaultRenderer, ...otherParams }) => {
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

  const customColumns = [
    {
      header: t('common.headers.status'),
      value: resource => <BTPResourceStatus status={resource.status} />,
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
