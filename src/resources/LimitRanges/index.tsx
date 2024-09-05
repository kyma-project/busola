import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';

export const resourceType = 'LimitRanges';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories['discovery-and-network'];

export const List = React.lazy(() => import('./LimitRangeList'));
export const Details = React.lazy(() => import('./LimitRangeDetails'));
export const Create = React.lazy(() => import('./LimitRangeCreate'));

export const i18nDescriptionKey = 'limit-ranges.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/policy/limit-range/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  depth: 1,
});
