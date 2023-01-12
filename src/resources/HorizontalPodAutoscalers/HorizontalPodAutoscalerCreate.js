import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

import { createHPATemplate } from './templates';

export function HorizontalPodAutoscalerCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [HPA, setHPA] = useState(createHPATemplate(namespaceId));
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="HorizontalPodAutoscalers"
      singularName={t('hpas.name_singular')}
      resource={HPA}
      setResource={setHPA}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
