import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
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
  const { t } = useTranslation();

  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [limitRange, setLimitRange] = useState(
    _.cloneDeep(initialLimitRange) ||
      createLimitRangeTemplate({ namespaceName: namespaceId }),
  );

  const [initialResource, setInitialResource] = useState(
    initialLimitRange ||
      createLimitRangeTemplate({
        namespaceName: namespaceId,
      }),
  );

  useEffect(() => {
    setLimitRange(
      _.cloneDeep(initialLimitRange) ||
        createLimitRangeTemplate({ namespaceName: namespaceId }),
    );
    setInitialResource(
      initialLimitRange ||
        createLimitRangeTemplate({
          namespaceName: namespaceId,
        }),
    );
  }, [initialLimitRange, namespaceId]);

  return (
    <ResourceForm
      {...props}
      pluralKind="limitRanges"
      singularName={t('limit-ranges.name_singular')}
      resource={limitRange}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setLimitRange}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
