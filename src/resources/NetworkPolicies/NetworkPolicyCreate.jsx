import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';

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
  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [networkPolicy, setNetworkPolicy] = useState(
    _.cloneDeep(initialNetworkPolicy) ||
      createNetworkPolicyTemplate(namespaceId),
  );
  const [initialResource, setInitialResource] = useState(
    initialNetworkPolicy || createNetworkPolicyTemplate(namespaceId),
  );

  useEffect(() => {
    //eslint-disable-next-line react-hooks/set-state-in-effect
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
