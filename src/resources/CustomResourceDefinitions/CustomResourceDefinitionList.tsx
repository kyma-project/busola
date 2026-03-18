import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Tokens } from 'shared/components/Tokens';

import CustomResourceDefinitionCreate from './CustomResourceDefinitionCreate';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/CustomResourceDefinitions';
import { ResourcesListProps } from 'shared/components/ResourcesList/types';
import { CRD } from './CRCreate';

export function CustomResourceDefinitionList({
  hideCreateOption,
  ...props
}: {
  hideCreateOption?: boolean;
  resourceUrl: string;
  resourceType: string;
} & Partial<ResourcesListProps>) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('custom-resource-definitions.headers.scope'),
      value: (crd: CRD) => ({
        content: crd.spec.scope,
        style: { wordBreak: 'keep-all' },
      }),
    },
    {
      header: t('custom-resource-definitions.headers.categories'),
      value: (crd: CRD) => <Tokens tokens={crd.spec.names?.categories} />,
    },
  ];

  return (
    <ResourcesList
      description={ResourceDescription}
      customColumns={customColumns}
      {...props}
      createResourceForm={
        hideCreateOption ? undefined : CustomResourceDefinitionCreate
      }
      searchSettings={{
        textSearchProperties: ['spec.names.categories'],
      }}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default CustomResourceDefinitionList;
