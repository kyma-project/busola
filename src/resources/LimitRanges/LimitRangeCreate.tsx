import { useEffect, useState, FormEventHandler, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { cloneDeep } from 'lodash';
import { createLimitRangeTemplate } from './templates';

interface LimitRangeCreateProps {
  formElementRef: RefObject<HTMLFormElement | null>;
  onChange: FormEventHandler<HTMLElement>;
  setCustomValid: (valid: boolean) => void;
  resourceUrl: string;
  resource?: any;
  [key: string]: any;
}

export default function LimitRangeCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialLimitRange,
  ...props
}: LimitRangeCreateProps) {
  const { t } = useTranslation();

  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [limitRange, setLimitRange] = useState(
    cloneDeep(initialLimitRange) ||
      createLimitRangeTemplate({ namespaceName: namespaceId }),
  );

  const [initialResource, setInitialResource] = useState(
    initialLimitRange ||
      createLimitRangeTemplate({
        namespaceName: namespaceId,
      }),
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLimitRange(
        cloneDeep(initialLimitRange) ||
          createLimitRangeTemplate({ namespaceName: namespaceId }),
      );
      setInitialResource(
        initialLimitRange ||
          createLimitRangeTemplate({
            namespaceName: namespaceId,
          }),
      );
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
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
