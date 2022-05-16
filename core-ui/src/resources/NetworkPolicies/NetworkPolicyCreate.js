import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ResourceForm } from 'shared/ResourceForm';

import { createNetworkPolicyTemplate } from './templates';

export function NetworkPolicyCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [networkPolicy, setNetworkPolicy] = useState(
    createNetworkPolicyTemplate(namespaceId),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="networkpolicies"
      singularName={t('network-policies.name_singular')}
      resource={networkPolicy}
      setResource={setNetworkPolicy}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
