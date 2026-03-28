import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';

import { createNetworkPolicyTemplate } from './templates';
import { CreateResourceFormProps } from 'shared/components/ResourceDetails/ResourceDetails';

export type NetworkPolicyCreateProps = CreateResourceFormProps & {
  resourceUrl: string;
};

export default function NetworkPolicyCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialNetworkPolicy,
  ...props
}: NetworkPolicyCreateProps) {
  const { t } = useTranslation();
  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [networkPolicy, setNetworkPolicy] = useState(
    cloneDeep(initialNetworkPolicy) || createNetworkPolicyTemplate(namespaceId),
  );
  const [initialResource, setInitialResource] = useState(
    initialNetworkPolicy || createNetworkPolicyTemplate(namespaceId),
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setNetworkPolicy(
        cloneDeep(initialNetworkPolicy) ||
          createNetworkPolicyTemplate(namespaceId),
      );
      setInitialResource(
        initialNetworkPolicy || createNetworkPolicyTemplate(namespaceId),
      );
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
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
