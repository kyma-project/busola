import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { FormItem, Label, Text } from '@ui5/webcomponents-react';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';
import jsYaml from 'js-yaml';

const CONFIGMAP_PATH =
  '/api/v1/namespaces/kube-system/configmaps/cluster-autoscaler-status';

type AutoscalerConfigMap = {
  data?: {
    status?: string;
  };
};

type AutoscalerStatus = {
  clusterWide?: {
    scaleDown?: { status?: string };
    scaleUp?: { status?: string };
  };
};

export function ClusterAutoscalingCard() {
  const { t } = useTranslation();
  const { data, error } = useGet(CONFIGMAP_PATH, {
    pollingInterval: 10000,
  }) as { data: AutoscalerConfigMap | null; error: any };

  if (error || !data) return null;

  const statusText = data.data?.status ?? '';
  const parsed = jsYaml.load(statusText) as AutoscalerStatus | null;
  const scaleDown = parsed?.clusterWide?.scaleDown?.status ?? null;
  const scaleUp = parsed?.clusterWide?.scaleUp?.status ?? null;

  return (
    <div className="item-wrapper card-wide">
      <ResourceDetailsCard
        className="item"
        titleText={t('cluster-overview.statistics.autoscaling')}
        content={
          <>
            <FormItem
              labelContent={
                <Label showColon>
                  {t('cluster-overview.statistics.autoscaling-scale-down')}
                </Label>
              }
            >
              <Text>{scaleDown ?? '-'}</Text>
            </FormItem>
            <FormItem
              labelContent={
                <Label showColon>
                  {t('cluster-overview.statistics.autoscaling-scale-up')}
                </Label>
              }
            >
              <Text>{scaleUp ?? '-'}</Text>
            </FormItem>
          </>
        }
      />
    </div>
  );
}
