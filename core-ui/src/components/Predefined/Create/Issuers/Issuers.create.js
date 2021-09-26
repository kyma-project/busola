import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from '../../../../shared/ResourceForm/ResourceForm';
import {
  createIssuerTemplate,
  createCATypeTemplate,
  createACMETypeTemplate,
} from './templates';
import { IssuerTypeDropdown } from './IssuerTypeDropdown';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';
import { Checkbox, FormLabel } from 'fundamental-react';
import * as jp from 'jsonpath';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

export function IssuersCreate({ onChange, formElementRef, namespace }) {
  const { t } = useTranslation();
  // const notification = useNotification();
  // const postRequest = usePost();

  const [issuer, setIssuer] = useState(createIssuerTemplate(namespace));
  const [issuerType, setIssuerType] = useState('');
  console.log('issuer', issuer);
  console.log('issuerType', issuerType);
  React.useEffect(() => {
    let issuerTypeObject = {};
    if (issuerType === 'ca') issuerTypeObject = createCATypeTemplate();
    else if (issuerType === 'acme') issuerTypeObject = createACMETypeTemplate();
    const spec = jp.value(issuer, '$.spec') || [];
    console.log('lolo1', spec, issuerType);
    delete spec.ca;
    delete spec.acme;
    console.log('lolo2', spec, issuerType);

    setIssuer({
      ...issuer,
      spec: {
        ...spec,
        ...issuerTypeObject,
      },
    });
    console.log('lolo2', issuer);
    // eslint-disable-next-line
  }, [issuerType, setIssuerType]);

  const issuerCAFields = () => {
    if (!issuerType || issuerType !== 'ca') return <></>;
    if (issuerType === 'ca') {
      return (
        <ResourceForm.FormField
          required
          propertyPath="$.spec.ca.privateKeySecretRef"
          tooltipContent={t('issuers.tooltips.secret-ref-ca')}
          label={t('issuers.private-key')}
          input={({ value, setValue }) => (
            <SecretRef
              id="secret-ref-input"
              resourceRef={value || {}}
              onChange={(_, privateKeySecretRef) =>
                setValue(privateKeySecretRef)
              }
            />
          )}
        />
      );
    }
  };

  const issuerSimpleACMEFields = () => {
    if (!issuerType || issuerType !== 'acme') return <></>;
    if (issuerType === 'acme') {
      return [
        <ResourceForm.FormField
          label={t('issuers.server')}
          propertyPath="$.spec.acme.server"
          tooltipContent={t('issuers.tooltips.server')}
          required
          placeholder={t('issuers.placeholders.server')}
          input={Inputs.Text}
        />,
        <ResourceForm.FormField
          label={t('issuers.email')}
          propertyPath="$.spec.acme.email"
          tooltipContent={t('issuers.tooltips.email')}
          required
          placeholder={t('issuers.placeholders.email')}
          input={Inputs.Text}
        />,
      ];
    }
  };

  const issuerAdvancedACMEFields = () => {
    if (!issuerType || issuerType !== 'acme') return <></>;
    if (issuerType === 'acme') {
      return [
        <ResourceForm.FormField
          advanced
          label={t('issuers.skip-dns')}
          propertyPath="$.spec.skipDNSChallengeValidation"
          tooltipContent={t('issuers.tooltips.skip-dns')}
          input={() => (
            <Checkbox
              compact
              checked={issuer.spec.skipDNSChallengeValidation}
              onChange={() =>
                setIssuer({
                  ...issuer,
                  spec: {
                    ...issuer.spec,
                    skipDNSChallengeValidation: !issuer.spec
                      .skipDNSChallengeValidation,
                  },
                })
              }
            />
          )}
        />,
      ];
    }
  };
  return (
    <ResourceForm
      pluralKind="issuers"
      singularName={t('issuers.name_singular')}
      resource={issuer}
      setResource={setIssuer}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={`/apis/dns.gardener.cloud/v1alpha1/namespaces/${namespace}/issuers/`}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('issuers.name_singular')}
        customSetValue={name => {
          jp.value(issuer, '$.metadata.name', name);
          jp.value(issuer, "$.metadata.labels['app.kubernetes.io/name']", name);
          setIssuer({ ...issuer });
        }}
      />
      <ResourceForm.FormField
        label={t('issuers.type')}
        required
        value={issuerType}
        setValue={type => {
          console.log('setIssuerType', type);
          setIssuerType(type);
        }}
        input={({ value, setValue }) => (
          <IssuerTypeDropdown type={value} setType={setValue} />
        )}
        tooltipContent={t('issuers.tooltips.issuer-type')}
      />

      {issuerCAFields()}
      {issuerSimpleACMEFields()}

      <ResourceForm.FormField
        advanced
        required
        label={t('issuers.requests-per-day')}
        propertyPath="$.spec.requestsPerDayQuota"
        tooltipContent={t('issuers.tooltips.requests')}
        placeholder={t('issuers.placeholders.requests-per-day')}
        input={Inputs.Number}
        className={issuerType === 'acme' ? '' : 'fd-margin-bottom--sm'}
      />

      {/* {issuerAdvancedACMEFields()} */}
    </ResourceForm>
  );
}
