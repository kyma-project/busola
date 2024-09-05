import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import * as _ from 'lodash';
import { createLimitRangeTemplate } from './templates';

export default function LimitRangeCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialLimitRange,
  ...props
}) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [limitRange, setLimitRange] = useState(
    _.cloneDeep(initialLimitRange) ||
      createLimitRangeTemplate({ namespaceName: namespaceId }),
  );
  const { t } = useTranslation();
  const [initialResource] = useState(
    initialLimitRange ||
      createLimitRangeTemplate({
        namespaceName: namespaceId,
      }),
  );

  const [initialUnchangedResource] = useState(initialLimitRange);

  return (
    <ResourceForm
      {...props}
      pluralKind="limitRanges"
      singularName={t('limit-ranges.name_singular')}
      resource={limitRange}
      initialResource={initialResource}
      initialUnchangedResource={initialUnchangedResource}
      setResource={setLimitRange}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
