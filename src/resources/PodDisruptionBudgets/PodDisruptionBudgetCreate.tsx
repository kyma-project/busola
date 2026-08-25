import { useEffect, useState, FormEventHandler, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { cloneDeep } from 'lodash';
import { createPodDisruptionBudgetTemplate } from './templates';
import type { PodDisruptionBudget } from './types';

interface PodDisruptionBudgetCreateProps {
  formElementRef: RefObject<HTMLFormElement | null>;
  onChange: FormEventHandler<HTMLElement>;
  setCustomValid: (valid: boolean) => void;
  resourceUrl: string;
  resource?: PodDisruptionBudget;
  [key: string]: any;
}

export default function PodDisruptionBudgetCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialPodDisruptionBudget,
  ...props
}: PodDisruptionBudgetCreateProps) {
  const { t } = useTranslation();

  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [podDisruptionBudget, setPodDisruptionBudget] = useState(
    cloneDeep(initialPodDisruptionBudget) ||
      createPodDisruptionBudgetTemplate({ namespaceName: namespaceId }),
  );

  const [initialResource, setInitialResource] = useState(
    initialPodDisruptionBudget ||
      createPodDisruptionBudgetTemplate({
        namespaceName: namespaceId,
      }),
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPodDisruptionBudget(
        cloneDeep(initialPodDisruptionBudget) ||
          createPodDisruptionBudgetTemplate({ namespaceName: namespaceId }),
      );
      setInitialResource(
        initialPodDisruptionBudget ||
          createPodDisruptionBudgetTemplate({
            namespaceName: namespaceId,
          }),
      );
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialPodDisruptionBudget, namespaceId]);

  return (
    <ResourceForm
      {...props}
      pluralKind="podDisruptionBudgets"
      singularName={t('pod-disruption-budgets.name_singular')}
      resource={podDisruptionBudget}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setPodDisruptionBudget}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
