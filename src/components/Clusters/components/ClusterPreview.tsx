import { Button, Label, Text, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import './ClusterPreview.scss';
import {
  findInitialValue,
  findInitialValues,
} from '../views/EditCluster/EditCluster';
import { getUserIndex } from '../shared';
import { ChooseStorage } from './ChooseStorage';
import { isOIDCExec } from './oidc-params';
import {
  Kubeconfig,
  KubeconfigNonOIDCAuthToken,
  KubeconfigOIDCAuth,
} from 'types';
import { Tokens } from 'shared/components/Tokens';

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
        <>
          <Label className="sap-margin-bottom-tiny" showColon>
            {t('clusters.wizard.auth.exec-command')}
          </Label>
          <Text>{execCommand}</Text>
        </>
      )}
      <Label className="sap-margin-top-small sap-margin-bottom-tiny" showColon>
        {t('clusters.token')}
      </Label>
      {token && <Text className="cluster-preview__token">{token}</Text>}
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
        <>
          <Label className="sap-margin-bottom-tiny" showColon>
            {t('clusters.labels.issuer-url')}
          </Label>
          <Text>{issuerUrl}</Text>
        </>
      )}
      {clientId && (
        <>
          <Label
            className="sap-margin-top-small sap-margin-bottom-tiny"
            showColon
          >
            {t('clusters.labels.client-id')}
          </Label>
          <Text>{clientId}</Text>
        </>
      )}
      {clientSecret && (
        <>
          <Label
            className="sap-margin-top-small sap-margin-bottom-tiny"
            showColon
          >
            {t('clusters.labels.client-secret')}
          </Label>
          <Text>{clientSecret}</Text>
        </>
      )}
      {extraScopes && (
        <>
          <Label
            className="sap-margin-top-small sap-margin-bottom-tiny"
            showColon
          >
            {t('clusters.labels.scopes')}
          </Label>
          <Tokens tokens={extraScopes} />
        </>
      )}
    </>
  );
};

interface ClusterPreviewProps {
  kubeconfig: Kubeconfig;
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

  const issuerUrl = findInitialValue(kubeconfig, 'oidc-issuer-url', userIndex);
  const clientId = findInitialValue(kubeconfig, 'oidc-client-id', userIndex);
  const clientSecret = findInitialValue(
    kubeconfig,
    'oidc-client-secret',
    userIndex,
  );
  const extraScopes = findInitialValues(
    kubeconfig,
    'oidc-extra-scope',
    userIndex,
  );

  const token = (
    kubeconfig?.users?.[userIndex]?.user as KubeconfigNonOIDCAuthToken
  )?.token;

  return (
    <div className="cluster-preview">
      <div className="add-cluster__content-container">
        <Title level="H5" className="sap-margin-bottom-medium">
          {t('clusters.wizard.review')}
        </Title>
        <Title
          level="H5"
          className="cluster-preview__subtitle sap-margin-y-small"
        >{`1. ${t('common.headers.configuration')}`}</Title>
        <div className="cluster-preview__content sap-margin-y-small">
          <div>
            <Label className="sap-margin-bottom-tiny" showColon>
              {t('clusters.name_singular')}
            </Label>
            <Text>{kubeconfig?.['current-context']}</Text>
          </div>
          <Button
            design="Transparent"
            onClick={() => setSelected(1)}
            className="cluster-preview__edit-button"
            accessibleName={`${t('common.buttons.edit')} ${t(
              'common.headers.configuration',
            )}`}
          >
            {t('common.buttons.edit')}
          </Button>
        </div>
        <Title
          level="H5"
          className="cluster-preview__subtitle sap-margin-y-small"
        >{`2. ${t('clusters.wizard.authentication')}`}</Title>

        <div className="cluster-preview__content sap-margin-y-small">
          <div className="cluster-preview__auth">
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
          </div>
          <Button
            design="Transparent"
            onClick={() => (hasAuth ? setSelected(1) : setSelected(2))}
            className="cluster-preview__edit-button"
            accessibleName={`${t('common.buttons.edit')} ${t(
              'clusters.wizard.authentication',
            )}`}
          >
            {t('common.buttons.edit')}
          </Button>
        </div>
        <Title
          level="H5"
          className="cluster-preview__subtitle sap-margin-y-small"
        >{`3. ${t('clusters.wizard.storage')}`}</Title>
        <div className="cluster-preview__content sap-margin-y-small">
          <ChooseStorage
            storage={storage}
            setStorage={() => {}}
            disabled
            name="storage-preview"
          />
          <Button
            design="Transparent"
            onClick={() => {
              hasAuth ? setSelected(2) : setSelected(3);
            }}
            className="cluster-preview__edit-button"
            accessibleName={`${t('common.buttons.edit')} ${t(
              'clusters.wizard.storage',
            )}`}
          >
            {t('common.buttons.edit')}
          </Button>
        </div>
      </div>
    </div>
  );
}
