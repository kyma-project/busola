import React, { useEffect, useState } from 'react';
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
  const { t } = useTranslation();
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [networkPolicy, setNetworkPolicy] = useState(
    _.cloneDeep(initialNetworkPolicy) ||
      createNetworkPolicyTemplate(namespaceId),
  );
  const [initialResource, setInitialResource] = useState(
    initialNetworkPolicy || createNetworkPolicyTemplate(namespaceId),
  );

  useEffect(() => {
    setNetworkPolicy(
      _.cloneDeep(initialNetworkPolicy) ||
        createNetworkPolicyTemplate(namespaceId),
    );
    setInitialResource(
      initialNetworkPolicy || createNetworkPolicyTemplate(namespaceId),
    );
  }, [initialNetworkPolicy, namespaceId]);

  return (
    <ResourceForm
      {...props}
      pluralKind="networkpolicies"
      singularName={t('network-policies.name_singular')}
      resource={networkPolicy}
      initialResource={initialResource}
      updateInitialResource={setNetworkPolicy}
      setResource={setNetworkPolicy}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
