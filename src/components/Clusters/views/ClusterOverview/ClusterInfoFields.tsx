import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FormItem, Label, Text } from '@ui5/webcomponents-react';
import { Tokens } from 'shared/components/Tokens';
import { useGetClusterInfo } from './useGetClusterInfo';

type KymaResourceLabels = { [key: string]: string };

// A list rather than a component, so the form can count the items when
// splitting them into columns.
export const useClusterInfoFields = (
  kymaResourceLabels?: KymaResourceLabels,
): ReactNode[] => {
  const { t } = useTranslation();
  const { clusterInfo, loading } = useGetClusterInfo();

  if (loading) return [];

  const globalAccountID =
    kymaResourceLabels?.['kyma-project.io/global-account-id'] ||
    clusterInfo?.globalAccountID;
  const subaccountID =
    kymaResourceLabels?.['kyma-project.io/subaccount-id'] ||
    clusterInfo?.subaccountID;

  return [
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
};
