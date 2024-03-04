import { Description } from 'shared/components/Description/Description';

export const i18nDescriptionKey = 'helm-releases.description';
export const docsURL = 'https://helm.sh/docs/glossary/#release';
export const showYamlTab = true;

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);
