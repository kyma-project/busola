import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FormItem, Label, ObjectStatus, Text } from '@ui5/webcomponents-react';
import { Tokens } from 'shared/components/Tokens';
import { useGetClusterInfo } from './useGetClusterInfo';

type KymaResourceLabels = { [key: string]: string };

export type ClusterInfoFieldGroups = {
  infrastructure: ReactNode[];
  btpAccount: ReactNode[];
  network: ReactNode[];
};

// Lists, not components, so each card's form can count items to split into columns.
export const useClusterInfoFields = (
  kymaResourceLabels?: KymaResourceLabels,
): ClusterInfoFieldGroups => {
  const { t } = useTranslation();
  const { clusterInfo, loading } = useGetClusterInfo();

  if (loading) {
    return { infrastructure: [], btpAccount: [], network: [] };
  }

  const globalAccountID =
    kymaResourceLabels?.['kyma-project.io/global-account-id'] ||
    clusterInfo?.globalAccountID;
  const subaccountID =
    kymaResourceLabels?.['kyma-project.io/subaccount-id'] ||
    clusterInfo?.subaccountID;
  const dualStackIPEnabled = clusterInfo?.networkDetails?.dualStackIPEnabled;

  const infrastructure = [
    !!clusterInfo?.provider && (
      <FormItem
        key="provider"
        labelContent={<Label showColon>{t('gardener.headers.provider')}</Label>}
      >
        <p className="gardener-provider">{clusterInfo.provider}</p>
      </FormItem>
    ),
    !!clusterInfo?.region && (
      <FormItem
        key="region"
        labelContent={<Label showColon>{t('clusters.overview.region')}</Label>}
      >
        <Text>{clusterInfo.region}</Text>
      </FormItem>
    ),
    !!clusterInfo?.platformRegion && (
      <FormItem
        key="platform-region"
        labelContent={
          <Label showColon>{t('clusters.overview.platform-region')}</Label>
        }
      >
        <Text>{clusterInfo.platformRegion}</Text>
      </FormItem>
    ),
    dualStackIPEnabled !== undefined && (
      <FormItem
        key="dual-stack-ip"
        labelContent={
          <Label showColon>{t('clusters.overview.dual-stack-ip')}</Label>
        }
      >
        <ObjectStatus
          state={dualStackIPEnabled ? 'Positive' : 'None'}
          aria-label={t('clusters.overview.dual-stack-ip')}
        >
          {dualStackIPEnabled
            ? t('common.labels.enabled')
            : t('common.labels.disabled')}
        </ObjectStatus>
      </FormItem>
    ),
    !!clusterInfo?.seedRegion && (
      <FormItem
        key="seed-region"
        labelContent={
          <Label showColon>{t('clusters.overview.seed-region')}</Label>
        }
      >
        <Text>{clusterInfo.seedRegion}</Text>
      </FormItem>
    ),
  ];

  const btpAccount = [
    !!globalAccountID && (
      <FormItem
        key="global-account-id"
        labelContent={
          <Label showColon>{t('clusters.overview.global-account-id')}</Label>
        }
      >
        <Text>{globalAccountID}</Text>
      </FormItem>
    ),
    !!subaccountID && (
      <FormItem
        key="subaccount-id"
        labelContent={
          <Label showColon>{t('clusters.overview.subaccount-id')}</Label>
        }
      >
        <Text>{subaccountID}</Text>
      </FormItem>
    ),
    !!clusterInfo?.environmentInstanceID && (
      <FormItem
        key="environment-instance-id"
        labelContent={
          <Label showColon>
            {t('clusters.overview.environment-instance-id')}
          </Label>
        }
      >
        <Text>{clusterInfo.environmentInstanceID}</Text>
      </FormItem>
    ),
    !!clusterInfo?.instanceName && (
      <FormItem
        key="instance-name"
        labelContent={
          <Label showColon>{t('clusters.overview.instance-name')}</Label>
        }
      >
        <Text>{clusterInfo.instanceName}</Text>
      </FormItem>
    ),
  ];

  const network = [
    !!clusterInfo?.natGatewayIps && (
      <FormItem
        key="nat-gateway-ips"
        labelContent={
          <Label showColon>{t('clusters.overview.nat-gateway-ips')}</Label>
        }
      >
        <Tokens tokens={clusterInfo.natGatewayIps} />
      </FormItem>
    ),
  ];

  return { infrastructure, btpAccount, network };
};
