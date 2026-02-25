import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { Description } from 'shared/components/Description/Description';
import { matchByOwnerReference, matchBySelector } from 'shared/utils/helpers';
import { predefinedCategories } from 'state/navigation/categories';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'Deployments';
export const namespaced = true;
export const apiGroup = 'apps';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const List = lazyWithRetries(() => import('./DeploymentList'));
export const Details = lazyWithRetries(() => import('./DeploymentDetails'));
export const Create = lazyWithRetries(() => import('./DeploymentCreate'));

export const i18nDescriptionKey = 'deployments.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
  relations: [
    {
      resource: { kind: 'HorizontalPodAutoscaler' },
      filter: (deployment, hpa) =>
        hpa.spec.scaleTargetRef?.kind === 'Deployment' &&
        hpa.spec.scaleTargetRef?.name === deployment.metadata.name,
    },
    {
      resource: { kind: 'Service' },
      filter: (deployment, service) =>
        matchBySelector(
          deployment.spec.selector.matchLabels,
          service.spec.selector,
        ),
    },
    {
      resource: { kind: 'ReplicaSet' },
      filter: (deployment, replicaSet) =>
        matchByOwnerReference({
          resource: replicaSet,
          owner: deployment,
        }),
    },
  ],
});
