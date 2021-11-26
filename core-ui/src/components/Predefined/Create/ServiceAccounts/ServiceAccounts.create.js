import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetList } from 'react-shared';
import { ResourceForm } from 'shared/ResourceForm';
import {
  K8sNameField,
  KeyValueField,
  ItemArray,
  ComboboxArrayInput,
} from 'shared/ResourceForm/fields';
import * as jp from 'jsonpath';
import { createServiceAccountTemplate, newSecret } from './templates';
import { SingleSecretForm } from './SecretForm';
import { validateServiceAccount } from './helpers';
import { Switch } from 'fundamental-react';
import _ from 'lodash';

const ServiceAccountsCreate = ({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialServiceAccounts,
  resourceUrl,
}) => {
  const { t } = useTranslation();

  const [serviceAccount, setServiceAccount] = useState(
    _.cloneDeep(initialServiceAccounts) ||
      createServiceAccountTemplate(namespace),
  );
  const [imagePullSecrets, setImagePullSecrets] = useState([]);

  React.useEffect(() => {
    setCustomValid(validateServiceAccount(serviceAccount));
  }, [serviceAccount, setCustomValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageChange = images => {
    setImagePullSecrets([...images]);
    const newImages = (images || []).map(image => {
      return { name: image };
    });
    jp.value(serviceAccount, '$.imagePullSecrets', newImages);

    if (!newImages.length) delete serviceAccount.imagePullSecrets;

    setServiceAccount({ ...serviceAccount });
  };

  const { data: data } = useGetList()(
    `/api/v1/namespaces/${namespace}/secrets`,
  );

  return (
    <ResourceForm
      pluralKind="serviceaccounts"
      singularName={t(`service-accounts.name_singular`)}
      resource={serviceAccount}
      setResource={setServiceAccount}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      initialResource={initialServiceAccounts}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('service-accounts.name_singular')}
        setValue={name => {
          jp.value(serviceAccount, '$.metadata.name', name);
          setServiceAccount({ ...serviceAccount });
        }}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />

      <ComboboxArrayInput
        advanced
        propertyPath="$.secrets"
        title={t('service-accounts.headers.secrets')}
        tooltipContent={t('service-accounts.create-modal.tooltips.secrets')}
        setValue={secrets => {
          const newSecrets = (secrets || []).map(secrets => {
            return { name: secrets };
          });
          jp.value(serviceAccount, '$.secrets', newSecrets);
          setServiceAccount({ ...serviceAccount });
        }}
        toInternal={values => (values || []).map(value => value?.name)}
        options={(data || [])
          .filter(
            secret => secret.type === 'kubernetes.io/service-account-token',
          )
          .map(i => ({
            key: i.metadata.name,
            text: i.metadata.name,
          }))}
      />
      <ComboboxArrayInput
        advanced
        title={t('service-accounts.headers.image-pull-secrets')}
        tooltipContent={t(
          'service-accounts.create-modal.tooltips.image-pull-secrets',
        )}
        propertyPath="$.imagePullSecrets"
        setValue={value => handleImageChange(value)}
        toInternal={values => (values || []).map(value => value?.name)}
        options={(data || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
      />
      <ResourceForm.FormField
        advanced
        label={t('service-accounts.headers.auto-mount-token')}
        tooltipContent={t(
          'service-accounts.create-modal.tooltips.auto-mount-token',
        )}
        input={() => (
          <Switch
            compact
            onChange={e => {
              const automountServiceAccountToken = jp.value(
                serviceAccount,
                '$.automountServiceAccountToken',
              );
              jp.value(
                serviceAccount,
                '$.automountServiceAccountToken',
                !automountServiceAccountToken,
              );
              setServiceAccount({ ...serviceAccount });
            }}
            checked={jp.value(serviceAccount, '$.automountServiceAccountToken')}
          />
        )}
      />
    </ResourceForm>
  );
};
ServiceAccountsCreate.allowEdit = true;
export { ServiceAccountsCreate };
