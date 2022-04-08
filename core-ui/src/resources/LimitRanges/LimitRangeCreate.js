import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ResourceForm } from 'shared/ResourceForm';

import { createLimitRangeTemplate } from './templates';

export function LimitRangeCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [limitRange, setLimitRange] = useState(
    createLimitRangeTemplate({ namespaceName: namespaceId }),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="limitRanges"
      singularName={t('limit-ranges.name_singular')}
      resource={limitRange}
      setResource={setLimitRange}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
      afterCreatedFn={() => {}}
    />
  );
}
