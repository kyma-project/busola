import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import {
  serviceInstanceToYaml,
  yamlToServiceInstance,
  createServiceInstanceTemplate,
} from './helpers.js';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm.js';

export function ServiceInstancesCreate(props) {
  return <ServiceInstancesForm namespaceId={props.namespace} {...props} />;
}

function ServiceInstancesForm({ namespaceId, formElementRef, onChange }) {
  const { t } = useTranslation();
  const [serviceInstance, setServiceInstance] = React.useState(
    createServiceInstanceTemplate(namespaceId),
  );

  const createServiceInstance = useCreateResource(
    'Service Instance',
    'serviceinstances',
    serviceInstanceToYaml(serviceInstance),
    `/apis/services.cloud.sap.com/v1alpha1/namespaces/${namespaceId}/serviceinstances/`,
  );

  return (
    <CreateForm
      simpleForm={
        <SimpleForm
          serviceInstance={serviceInstance}
          setServiceInstance={setServiceInstance}
        />
      }
      advancedForm={
        <AdvancedForm
          serviceInstance={serviceInstance}
          setServiceInstance={setServiceInstance}
        />
      }
      modalOpeningComponent={
        <Button glyph="add">{t('btp-instances.create.title')}</Button>
      }
      resource={serviceInstance}
      setResource={setServiceInstance}
      onClose={() =>
        setServiceInstance(createServiceInstanceTemplate(namespaceId))
      }
      toYaml={serviceInstanceToYaml}
      fromYaml={yamlToServiceInstance}
      onCreate={createServiceInstance}
      onChange={onChange}
      formElementRef={formElementRef}
    />
  );
}
