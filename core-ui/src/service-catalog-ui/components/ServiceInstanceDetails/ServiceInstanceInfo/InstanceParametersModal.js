import React from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'react-shared';
import { serviceInstanceConstants } from 'helpers/constants';

InstanceParametersModal.propTypes = {
  parameters: PropTypes.object,
  servicePlan: PropTypes.shape({ externalName: PropTypes.string }).isRequired,
};

export default function InstanceParametersModal({
  parameters,
  servicePlan,
  i18n,
}) {
  if (!parameters) return servicePlan.externalName;

  const formattedPlan = JSON.stringify(parameters, null, 2);

  const modalOpeningComponent = (
    <button className="link has-padding-0" option="transparent">
      {servicePlan.externalName}
    </button>
  );

  return (
    <Modal
      modalOpeningComponent={modalOpeningComponent}
      title={serviceInstanceConstants.instanceParameters}
      confirmText="Close"
      i18n={i18n}
    >
      <pre>{formattedPlan}</pre>
    </Modal>
  );
}
