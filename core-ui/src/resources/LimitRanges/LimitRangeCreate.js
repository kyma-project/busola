import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

import { createLimitRangeTemplate } from './templates';

export function LimitRangeCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [limitRange, setLimitRange] = useState(
    createLimitRangeTemplate({ namespaceName: namespaceId }),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
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
