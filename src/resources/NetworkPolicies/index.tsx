import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { Description } from 'shared/components/Description/Description';
import { matchBySelector } from 'shared/utils/helpers';
import { predefinedCategories } from 'state/navigation/categories';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'NetworkPolicies';
export const namespaced = true;
export const apiGroup = 'networking.k8s.io';
export const apiVersion = 'v1';
export const category = predefinedCategories['discovery-and-network'];

export const i18nDescriptionKey = 'network-policies.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/services-networking/network-policies/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = lazyWithRetries(() => import('./NetworkPolicyList'));
export const Details = lazyWithRetries(() => import('./NetworkPolicyDetails'));
export const Create = lazyWithRetries(() => import('./NetworkPolicyCreate'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      resource: { kind: 'Pod' },
      filter: (policy, pod) =>
        matchBySelector(
          policy.spec.podSelector.matchLabels,
          pod.metadata.labels,
        ),
    },
  ],
});
