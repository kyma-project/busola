import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'Ingresses';
export const namespaced = true;
export const apiGroup = 'networking.k8s.io';
export const apiVersion = 'v1';
export const category = predefinedCategories['discovery-and-network'];

export const List = lazyWithRetries(() => import('./IngressList'));
export const Details = lazyWithRetries(() => import('./IngressDetails'));
export const Create = lazyWithRetries(() => import('./IngressCreate'));

export const i18nDescriptionKey = 'ingresses.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/services-networking/ingress/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowLevel: 0,
  networkFlowKind: true,
  relations: [
    {
      resource: { kind: 'Service' },
      filter: (ingress, service) =>
        (ingress.spec.rules || []).some((rule: any) =>
          (rule.http?.paths || []).some(
            (path: any) =>
              path.backend?.service?.name === service.metadata.name,
          ),
        ) ||
        ingress.spec?.defaultBackend?.resource?.name === service.metadata.name,
    },
  ],
});
