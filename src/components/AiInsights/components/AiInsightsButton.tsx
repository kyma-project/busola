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
    // Preserve `useJoule` via spread — overwriting it would flip Joule users to
    // the in-app Companion for the rest of the session. Insights mode is
    // rendered regardless of `useJoule` via the App.tsx render guard.
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
