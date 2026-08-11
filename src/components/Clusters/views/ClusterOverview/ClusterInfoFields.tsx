import { useTranslation } from 'react-i18next';
import { FormItem, Text, Label } from '@ui5/webcomponents-react';
import { Tokens } from 'shared/components/Tokens';
import { useGetClusterInfo } from './useGetClusterInfo';

const GardenerProvider = ({ provider }: { provider?: string }) => {
  const { t } = useTranslation();

  if (!provider) return null;
  return (
    <FormItem
      labelContent={<Label showColon>{t('gardener.headers.provider')}</Label>}
    >
      <p className="gardener-provider">{provider}</p>
    </FormItem>
  );
};

type ClusterInfoFieldsProps = {
  kymaResourceLabels?: { [key: string]: string };
};

export const ClusterInfoFields = ({
  kymaResourceLabels,
}: ClusterInfoFieldsProps) => {
  const { t } = useTranslation();
  const { clusterInfo, loading } = useGetClusterInfo();

  if (loading) return null;

  return (
    <>
      <GardenerProvider provider={clusterInfo?.provider} />
      {!!(
        kymaResourceLabels?.['kyma-project.io/global-account-id'] ||
        clusterInfo?.globalAccountID
      ) && (
        <FormItem
          labelContent={
            <Label showColon>{t('clusters.overview.global-account-id')}</Label>
          }
        >
          <Text>
            {kymaResourceLabels?.['kyma-project.io/global-account-id'] ||
              clusterInfo?.globalAccountID}
          </Text>
        </FormItem>
      )}
      {!!(
        kymaResourceLabels?.['kyma-project.io/subaccount-id'] ||
        clusterInfo?.subaccountID
      ) && (
        <FormItem
          labelContent={
            <Label showColon>{t('clusters.overview.subaccount-id')}</Label>
          }
        >
          <Text>
            {kymaResourceLabels?.['kyma-project.io/subaccount-id'] ||
              clusterInfo?.subaccountID}
          </Text>
        </FormItem>
      )}
      {!!clusterInfo?.natGatewayIps && (
        <FormItem
          labelContent={
            <Label showColon>{t('clusters.overview.nat-gateway-ips')}</Label>
          }
        >
          <Tokens tokens={clusterInfo.natGatewayIps} />
        </FormItem>
      )}
    </>
  );
};
