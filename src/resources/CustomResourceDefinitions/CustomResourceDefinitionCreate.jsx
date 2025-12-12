import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import * as _ from 'lodash';

import { createCustomResourceDefinitionsTemplate } from './templates';

export default function CustomResourceDefinitionCreate({
  namespace,
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialCustomResourceDefinition,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();
  const [customResourceDefinitions, setCustomResourceDefinitions] = useState(
    _.cloneDeep(initialCustomResourceDefinition) ||
      createCustomResourceDefinitionsTemplate(namespace),
  );
  const [initialResource, setInitialResource] = useState(
    initialCustomResourceDefinition ||
      createCustomResourceDefinitionsTemplate(namespace),
  );
  const [prevNamespace, setPrevNamespace] = useState(namespace);

  if (
    (initialCustomResourceDefinition &&
      initialCustomResourceDefinition !== initialResource) ||
    namespace !== prevNamespace
  ) {
    setPrevNamespace(namespace);
    setCustomResourceDefinitions(
      _.cloneDeep(initialCustomResourceDefinition) ||
        createCustomResourceDefinitionsTemplate(namespace),
    );
    setInitialResource(
      initialCustomResourceDefinition ||
        createCustomResourceDefinitionsTemplate(namespace),
    );
  }

  return (
    <ResourceForm
      {...props}
      pluralKind="customresourcedefinitions"
      singularName={t('custom-resource-definitions.name_singular')}
      resource={customResourceDefinitions}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setCustomResourceDefinitions}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
      autocompletionDisabled={true}
    />
  );
}
