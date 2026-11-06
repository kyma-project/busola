import {
  Button,
  Form,
  FormItem,
  Label,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import './ClusterPreview.scss';
import {
  findInitialValue,
  findInitialValues,
} from '../views/EditCluster/EditCluster';
import { getUserIndex } from '../shared';
import { isOIDCExec } from './oidc-params';
import {
  Kubeconfig,
  KubeconfigNonOIDCAuthToken,
  KubeconfigOIDCAuth,
  ValidKubeconfig,
} from 'types';
import { Tokens } from 'shared/components/Tokens';

const PreviewStep = ({
  index,
  title,
  onEdit,
  children,
}: {
  index: number;
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation();

  return (
    <div className="cluster-preview__step">
      <div className="cluster-preview__step-header">
        <Title level="H5" className="cluster-preview__subtitle">
          {`${index}. ${title}`}
        </Title>
        <Button
          design="Transparent"
          onClick={onEdit}
          className="cluster-preview__edit-button"
          accessibleName={`${t('common.buttons.edit')} ${title}`}
        >
          {t('common.buttons.edit')}
        </Button>
      </div>
      <Form
        className="cluster-preview__form"
        layout="S1 M1 L1 XL1"
        labelSpan="S12 M4 L4 XL4"
        itemSpacing="Large"
      >
        {children}
      </Form>
    </div>
  );
};

const TokenData = ({
  token,
  execCommand,
}: {
  token: string;
  execCommand?: string;
}) => {
  const { t } = useTranslation();

  return (
    <>
      {execCommand && (
        <FormItem
          labelContent={
            <Label showColon>{t('clusters.wizard.auth.exec-command')}</Label>
          }
        >
          <Text>{execCommand}</Text>
        </FormItem>
      )}
      <FormItem labelContent={<Label showColon>{t('clusters.token')}</Label>}>
        {token && <Text className="cluster-preview__token">{token}</Text>}
      </FormItem>
    </>
  );
};

const OidcData = ({
  issuerUrl,
  clientId,
  clientSecret,
  extraScopes,
}: {
  issuerUrl?: string;
  clientId?: string;
  clientSecret?: string;
  extraScopes?: string[];
}) => {
  const { t } = useTranslation();

  return (
    <>
      {issuerUrl && (
        <FormItem
          labelContent={
            <Label showColon>{t('clusters.labels.issuer-url')}</Label>
          }
        >
          <Text>{issuerUrl}</Text>
        </FormItem>
      )}
      {clientId && (
        <FormItem
          labelContent={
            <Label showColon>{t('clusters.labels.client-id')}</Label>
          }
        >
          <Text>{clientId}</Text>
        </FormItem>
      )}
      {clientSecret && (
        <FormItem
          labelContent={
            <Label showColon>{t('clusters.labels.client-secret')}</Label>
          }
        >
          <Text>{clientSecret}</Text>
        </FormItem>
      )}
      {extraScopes && (
        <FormItem
          labelContent={<Label showColon>{t('clusters.labels.scopes')}</Label>}
        >
          <Tokens tokens={extraScopes} />
        </FormItem>
      )}
    </>
  );
};

interface ClusterPreviewProps {
  kubeconfig?: Kubeconfig;
  storage: string;
  setSelected: (selected: number) => void;
  hasAuth: boolean;
}

export function ClusterPreview({
  kubeconfig,
  storage,
  setSelected,
  hasAuth,
}: ClusterPreviewProps) {
  const { t } = useTranslation();
  const userIndex = getUserIndex(kubeconfig);
  const exec = (kubeconfig?.users?.[userIndex]?.user as KubeconfigOIDCAuth)
    ?.exec;
  const authenticationType = exec && isOIDCExec(exec) ? 'oidc' : 'token';

  const issuerUrl = findInitialValue(
    kubeconfig as ValidKubeconfig,
    'oidc-issuer-url',
    userIndex,
  );
  const clientId = findInitialValue(
    kubeconfig as ValidKubeconfig,
    'oidc-client-id',
    userIndex,
  );
  const clientSecret = findInitialValue(
    kubeconfig as ValidKubeconfig,
    'oidc-client-secret',
    userIndex,
  );
  const extraScopes = findInitialValues(
    kubeconfig as ValidKubeconfig,
    'oidc-extra-scope',
    userIndex,
  );

  const token = (
    kubeconfig?.users?.[userIndex]?.user as KubeconfigNonOIDCAuthToken
  )?.token;

  const storageText = `${t(`clusters.storage.labels.${storage}`)}: ${t(
    `clusters.storage.descriptions.${storage}`,
  )}`;

  return (
    <div className="cluster-preview">
      <div className="add-cluster__content-container">
        <Title level="H5" className="sap-margin-bottom-medium">
          {t('clusters.wizard.review')}
        </Title>
        <PreviewStep
          index={1}
          title={t('common.headers.configuration')}
          onEdit={() => setSelected(1)}
        >
          <FormItem
            labelContent={
              <Label showColon>{t('clusters.name_singular')}</Label>
            }
          >
            <Text>{kubeconfig?.['current-context']}</Text>
          </FormItem>
        </PreviewStep>
        <PreviewStep
          index={2}
          title={t('clusters.wizard.authentication')}
          onEdit={() => (hasAuth ? setSelected(1) : setSelected(2))}
        >
          {authenticationType === 'token' ? (
            <TokenData token={token} execCommand={exec?.command} />
          ) : (
            <OidcData
              issuerUrl={issuerUrl}
              clientId={clientId}
              clientSecret={clientSecret}
              extraScopes={extraScopes}
            />
          )}
        </PreviewStep>
        <PreviewStep
          index={3}
          title={t('clusters.wizard.storage')}
          onEdit={() => (hasAuth ? setSelected(2) : setSelected(3))}
        >
          <FormItem
            labelContent={
              <Label showColon>
                {t('clusters.storage.storage-preference')}
              </Label>
            }
          >
            <Text>{storageText}</Text>
          </FormItem>
        </PreviewStep>
      </div>
    </div>
  );
}
