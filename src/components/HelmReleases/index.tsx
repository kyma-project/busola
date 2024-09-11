import React from 'react';
import { Description } from 'shared/components/Description/Description';

export const i18nDescriptionKey = 'helm-releases.description';
export const docsURL = 'https://helm.sh/docs/glossary/#release';
export const showYamlTab = true;

export const List = React.lazy(() => import('./HelmReleasesList'));
export const Details = React.lazy(() => import('./HelmReleasesDetails'));

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);
