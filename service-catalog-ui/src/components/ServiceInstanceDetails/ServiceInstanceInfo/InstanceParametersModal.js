import React from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'react-shared';
import { getResourceDisplayName } from 'helpers';
import { serviceInstanceConstants } from 'helpers/constants';

InstanceParametersModal.propTypes = {
  serviceInstance: PropTypes.object.isRequired,
  instancePlan: PropTypes.object.isRequired,
};

export default function InstanceParametersModal({ parameters, servicePlan }) {
  const formattedPlan = JSON.stringify(parameters, null, 2);

  const modalOpeningComponent = (
    <button className="link has-padding-0" option="light">
      {servicePlan.externalName}
    </button>
  );

  return (
    <Modal
      modalOpeningComponent={modalOpeningComponent}
      title={serviceInstanceConstants.instanceParameters}
      confirmText="Close"
    >
      <pre>{formattedPlan}</pre>
    </Modal>
  );
}
