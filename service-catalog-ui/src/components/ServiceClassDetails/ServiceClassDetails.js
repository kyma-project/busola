import React from 'react';

import { Button } from 'fundamental-react';
import { Tooltip, ModalWithForm, useMicrofrontendContext } from 'react-shared';

import './ServiceClassDetails.scss';
import { getResourceDisplayName, isStringValueEqualToTrue } from 'helpers';
import { createInstanceConstants } from 'helpers/constants';
import CreateInstanceForm from './CreateInstanceForm/CreateInstanceForm';
import ServiceClassDetailsHeader from './ServiceClassDetailsHeader/ServiceClassDetailsHeader';
import ServiceClassInstancesTable from './ServiceClassInstancesTable/ServiceClassInstancesTable';

export default function ServiceClassDetails({
  serviceClass,
  serviceInstances,
  servicePlans,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const serviceClassDisplayName = getResourceDisplayName(serviceClass);
  const isActivated = serviceInstances?.length > 0;

  const isProvisionedOnlyOnce =
    serviceClass.spec.externalMetadata?.labels &&
    isStringValueEqualToTrue(
      serviceClass.spec.externalMetadata.labels.provisionOnlyOnce,
    );

  const modalOpeningComponent = (
    <Tooltip content={createInstanceConstants.provisionOnlyOnceInfo}>
      <Button disabled={isProvisionedOnlyOnce && isActivated} glyph="add">
        {isProvisionedOnlyOnce
          ? isActivated
            ? createInstanceConstants.buttonText.provisionOnlyOnceActive
            : createInstanceConstants.buttonText.provisionOnlyOnce
          : createInstanceConstants.buttonText.standard}
      </Button>
    </Tooltip>
  );

  return (
    <>
      <ServiceClassDetailsHeader serviceClass={serviceClass}>
        <ModalWithForm
          title={`Provision the ${serviceClassDisplayName}${' '}
                  ${serviceClass.kind}${' '}
                  in the ${namespaceId} Namespace`}
          modalOpeningComponent={modalOpeningComponent}
          id="add-instance-modal"
          item={serviceClass}
          renderForm={props => (
            <CreateInstanceForm
              {...props}
              plans={servicePlans || []}
              documentationUrl={
                serviceClass.spec.externalMetadata?.documentationUrl
              }
            />
          )}
        />
      </ServiceClassDetailsHeader>
      <ServiceClassInstancesTable instanceList={serviceInstances} />
    </>
  );
}
