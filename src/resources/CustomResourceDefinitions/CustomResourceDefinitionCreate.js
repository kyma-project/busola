import React, { useState } from 'react';

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

  return (
    <ResourceForm
      {...props}
      pluralKind="customresourcedefinitions"
      singularName={t('custom-resource-definitions.name_singular')}
      resource={customResourceDefinitions}
      initialResource={initialCustomResourceDefinition}
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
