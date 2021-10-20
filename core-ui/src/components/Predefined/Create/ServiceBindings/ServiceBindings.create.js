import React from 'react';
import * as jp from 'jsonpath';

import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import {
  serviceBindingToYaml,
  yamlToServiceBinding,
  createServiceBindingTemplate,
} from './helpers';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';

export function ServiceBindingsCreate(props) {
  return <ServiceBindingsForm namespaceId={props.namespace} {...props} />;
}

export function ServiceBindingsForm({
  namespaceId,
  formElementRef,
  onChange,
  setCustomValid,
}) {
  const { t } = useTranslation();
  const [serviceBinding, setServiceBinding] = React.useState(
    createServiceBindingTemplate(namespaceId),
  );

  React.useEffect(() => {
    const hasInstanceName = jp.value(serviceBinding, '$.instanceName');

    setCustomValid(hasInstanceName);
  }, [serviceBinding, setCustomValid]);

  const createServiceBinding = useCreateResource(
    'Service Binding',
    'servicebindings',
    serviceBindingToYaml(serviceBinding),
    `/apis/services.cloud.sap.com/v1alpha1/namespaces/${namespaceId}/servicebindings/`,
  );

  return (
    <CreateForm
      simpleForm={
        <SimpleForm
          serviceBinding={serviceBinding}
          setServiceBinding={setServiceBinding}
          namespaceId={namespaceId}
        />
      }
      advancedForm={
        <AdvancedForm
          serviceBinding={serviceBinding}
          setServiceBinding={setServiceBinding}
          namespaceId={namespaceId}
          setRefsValid={setCustomValid}
        />
      }
      modalOpeningComponent={
        <Button glyph="add">{t('btp-service-bindings.create.title')}</Button>
      }
      resource={serviceBinding}
      setResource={setServiceBinding}
      onClose={() =>
        setServiceBinding(createServiceBindingTemplate(namespaceId))
      }
      toYaml={serviceBindingToYaml}
      fromYaml={yamlToServiceBinding}
      onCreate={createServiceBinding}
      onChange={onChange}
      formElementRef={formElementRef}
    />
  );
}
