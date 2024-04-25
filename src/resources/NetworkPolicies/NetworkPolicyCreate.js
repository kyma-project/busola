import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

import { createNetworkPolicyTemplate } from './templates';

export default function NetworkPolicyCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialNetworkPolicy,
  ...props
}) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [networkPolicy, setNetworkPolicy] = useState(
    _.cloneDeep(initialNetworkPolicy) ||
      createNetworkPolicyTemplate(namespaceId),
  );
  const { t } = useTranslation();

  if (!initialNetworkPolicy) {
    initialNetworkPolicy = createNetworkPolicyTemplate(namespaceId);
  }

  return (
    <ResourceForm
      {...props}
      pluralKind="networkpolicies"
      singularName={t('network-policies.name_singular')}
      resource={networkPolicy}
      initialResource={initialNetworkPolicy}
      setResource={setNetworkPolicy}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
