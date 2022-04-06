import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ResourceForm } from 'shared/ResourceForm';

import { createDestinationRuleTemplate } from './templates';

function DestinationRuleCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [destinationRule, setDestinationRule] = useState(
    createDestinationRuleTemplate(namespaceId),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="destinationrules"
      singularName={t('destination-rules.name_singular')}
      resource={destinationRule}
      setResource={setDestinationRule}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
export { DestinationRuleCreate };
