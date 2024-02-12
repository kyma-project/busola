import React, { useEffect, useState } from 'react';
import { Button, FlexBox, RadioButton, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import './ClusterPreview.scss';
import { spacing } from '@ui5/webcomponents-react-base';
import { findInitialValue } from '../views/EditCluster/EditCluster';

export function ClusterPreview({
  token,
  kubeconfig,
  storage,
  setSelected,
  hasAuth,
}) {
  const { t } = useTranslation();
  const [authenticationType, setAuthenticationType] = useState(
    kubeconfig?.users?.[0]?.user?.exec ? 'oidc' : 'token',
  );

  useEffect(() => {
    setAuthenticationType(
      kubeconfig?.users?.[0]?.user?.exec ? 'oidc' : 'token',
    );
  }, [kubeconfig]);

  const OidcData = () => {
    const issuerUrl = findInitialValue(kubeconfig, 'oidc-issuer-url');
    const clientId = findInitialValue(kubeconfig, 'oidc-client-id');
    const clientSecret = findInitialValue(kubeconfig, 'oidc-client-secret');
    const extraScope = findInitialValue(kubeconfig, 'oidc-extra-scope');
    return (
      <>
        {issuerUrl && (
          <>
            <p
              className="cluster-preview__data-header"
              style={{
                ...spacing.sapUiSmallMarginTop,
                ...spacing.sapUiTinyMarginBottom,
              }}
            >
              {t('clusters.labels.issuer-url')}:
            </p>
            <div>{issuerUrl}</div>
          </>
        )}
        {clientId && (
          <>
            <p
              className="cluster-preview__data-header"
              style={{
                ...spacing.sapUiSmallMarginTop,
                ...spacing.sapUiTinyMarginBottom,
              }}
            >
              {t('clusters.labels.client-id')}:
            </p>
            <div>{clientId}</div>
          </>
        )}
        {clientSecret && (
          <>
            <p
              className="cluster-preview__data-header"
              style={{
                ...spacing.sapUiSmallMarginTop,
                ...spacing.sapUiTinyMarginBottom,
              }}
            >
              {t('clusters.labels.client-secret')}:
            </p>
            <div>{clientSecret}</div>
          </>
        )}
        {extraScope && (
          <>
            <p
              className="cluster-preview__data-header"
              style={{
                ...spacing.sapUiSmallMarginTop,
                ...spacing.sapUiTinyMarginBottom,
              }}
            >
              {t('clusters.labels.scopes')}:
            </p>
            <div>{extraScope}</div>
          </>
        )}
      </>
    );
  };

  const TokenData = () => {
    const token = kubeconfig?.users?.[0]?.user?.token;
    return (
      <>
        <p
          className="cluster-preview__data-header"
          style={{
            ...spacing.sapUiSmallMarginTop,
            ...spacing.sapUiTinyMarginBottom,
          }}
        >
          {`${t('clusters.token')}:`}
        </p>
        {token && <div className="cluster-preview__token">{token}</div>}
      </>
    );
  };

  return (
    <div className="cluster-preview add-cluster__content-container">
      <Title level="H5" style={spacing.sapUiMediumMarginBottom}>
        {t('clusters.wizard.review')}
      </Title>
      <Title
        level="H5"
        className="cluster-preview__subtitle"
        style={spacing.sapUiSmallMarginTopBottom}
      >{`1. ${t('configuration.title')}`}</Title>
      <p
        className="cluster-preview__data-header"
        style={{
          ...spacing.sapUiSmallMarginTop,
          ...spacing.sapUiTinyMarginBottom,
        }}
      >
        {t('clusters.name_singular')}:
      </p>
      <div
        className="cluster-preview__content"
        style={{
          ...spacing.sapUiMediumMarginBottom,
          ...spacing.sapUiTinyMarginTop,
        }}
      >
        <div>{kubeconfig?.['current-context']}</div>
        <Button
          design="Transparent"
          onClick={() => setSelected(1)}
          className="cluster-preview__edit-button"
        >
          {t('common.buttons.edit')}
        </Button>
      </div>
      <Title
        level="H5"
        className="cluster-preview__subtitle"
        style={spacing.sapUiSmallMarginTopBottom}
      >{`2. ${t('clusters.wizard.authentication')}`}</Title>

      <div
        className="cluster-preview__content"
        style={{
          ...spacing.sapUiMediumMarginBottom,
          ...spacing.sapUiTinyMarginTop,
        }}
      >
        <div className="cluster-preview__auth">
          {authenticationType === 'token' ? <TokenData /> : <OidcData />}
        </div>
        <Button
          design="Transparent"
          onClick={() => (hasAuth ? setSelected(1) : setSelected(2))}
          className="cluster-preview__edit-button"
        >
          {t('common.buttons.edit')}
        </Button>
      </div>
      <Title
        level="H5"
        className="cluster-preview__subtitle"
        style={spacing.sapUiSmallMarginTopBottom}
      >{`3. ${t('clusters.wizard.storage')}`}</Title>
      <p
        className="cluster-preview__data-header"
        style={{
          ...spacing.sapUiSmallMarginTop,
          ...spacing.sapUiTinyMarginBottom,
        }}
      >
        {`${t('clusters.storage.storage-preference')}:`}
      </p>
      <div
        className="cluster-preview__content"
        style={{
          ...spacing.sapUiMediumMarginBottom,
          ...spacing.sapUiTinyMarginTop,
        }}
      >
        <FlexBox
          direction="Column"
          className="cluster-preview__storage-container"
        >
          <RadioButton
            checked={storage === 'localStorage'}
            text={`${t('clusters.storage.labels.localStorage')}: ${t(
              'clusters.storage.descriptions.localStorage',
            )}`}
            disabled
            className="cluster-preview__storage"
          />
          <RadioButton
            checked={storage === 'sessionStorage'}
            text={`${t('clusters.storage.labels.sessionStorage')}: ${t(
              'clusters.storage.descriptions.sessionStorage',
            )}`}
            disabled
            className="cluster-preview__storage"
          />
          <RadioButton
            checked={storage === 'inMemory'}
            text={`${t('clusters.storage.labels.inMemory')}: ${t(
              'clusters.storage.descriptions.inMemory',
            )}`}
            disabled
            className="cluster-preview__storage"
          />
        </FlexBox>
        <Button
          design="Transparent"
          onClick={() => {
            hasAuth ? setSelected(2) : setSelected(3);
          }}
          className="cluster-preview__edit-button"
        >
          {t('common.buttons.edit')}
        </Button>
      </div>
    </div>
  );
}
