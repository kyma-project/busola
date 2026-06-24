import { Button, ButtonDomRef, Ui5CustomEvent } from '@ui5/webcomponents-react';
import type { ButtonClickEventDetail } from '@ui5/webcomponents/dist/Button.js';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import { K8sResource } from 'types';

type AiInsightsButtonProps = {
  resource: (K8sResource & { apiVersion?: string }) | null | undefined;
};

export function AiInsightsButton({ resource }: AiInsightsButtonProps) {
  const { t } = useTranslation();
  const setShowCompanion = useSetAtom(showKymaCompanionAtom);

  if (!resource?.metadata?.name || !resource?.kind) return null;

  const openInsights = (
    e: Ui5CustomEvent<ButtonDomRef, ButtonClickEventDetail>,
  ) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    // Spread to preserve `useJoule` — a literal object would clobber it.
    setShowCompanion((prev) => ({
      ...prev,
      show: true,
      fullScreen: false,
      insightsTarget: {
        resourceKind: resource.kind ?? '',
        resourceName: resource.metadata.name,
        resourceApiVersion: resource.apiVersion ?? '',
        namespace: resource.metadata.namespace ?? '',
      },
    }));
  };

  return (
    <Button
      design="Transparent"
      icon="ai"
      onClick={openInsights}
      tooltip={t('ai-insights.tooltip')}
      accessibleName={t('ai-insights.tooltip')}
    />
  );
}
