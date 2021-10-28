import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetList } from 'react-shared';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as jp from 'jsonpath';
import { createServiceAccountTemplate, newSecret } from './templates';
import { SingleSecretForm } from './SecretForm';
import { validateServiceAccount } from './helpers';
import { Switch } from 'fundamental-react';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

export const ServiceAccountsCreate = ({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) => {
  const { t } = useTranslation();

  const [serviceAccount, setServiceAccount] = useState(
    createServiceAccountTemplate(namespace),
  );
  const [imagePullSecrets, setImagePullSecrets] = useState([]);

  React.useEffect(() => {
    setCustomValid(validateServiceAccount(serviceAccount));
  }, [imagePullSecrets, setCustomValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageChange = images => {
    setImagePullSecrets([...images]);
    const newImages = (images || []).map(image => {
      return { name: image };
    });
    jp.value(serviceAccount, '$.imagePullSecrets', newImages);

    if (!newImages.length) delete serviceAccount.imagePullSecrets;

    setServiceAccount({ ...serviceAccount });
  };

  const { data: secrets } = useGetList()(
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
      createUrl={`/api/v1/namespaces/${namespace}/serviceaccounts/`}
    >
      <ResourceForm.FormField
        required
        label={t('common.labels.name')}
        placeholder={t('components.k8s-name-input.placeholder', {
          resourceType: t(`service-accounts.name_singular`),
        })}
        input={Inputs.Text}
        propertyPath="$.metadata.name"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />

      <ResourceForm.ItemArray
        advanced
        propertyPath="$.secrets"
        listTitle={t('service-accounts.headers.secrets')}
        nameSingular={t('service-accounts.headers.secret')}
        tooltipContent={t('service-accounts.create-modal.tooltips.secrets')}
        entryTitle={subject => subject?.name}
        allowEmpty={true}
        itemRenderer={(current, allValues, setAllValues, index) => (
          <SingleSecretForm
            secret={current}
            secrets={allValues}
            setSecrets={setAllValues}
            index={index}
            namespace={namespace}
            advanced
          />
        )}
        newResourceTemplateFn={() => newSecret(namespace)}
      />
      <ResourceForm.ComboboxArrayInput
        advanced
        title={t('service-accounts.headers.image-pull-secrets')}
        tooltipContent={t(
          'service-accounts.create-modal.tooltips.image-pull-secrets',
        )}
        // propertyPath="$.imagePullSecrets"
        value={imagePullSecrets}
        setValue={value => handleImageChange(value)}
        options={(secrets || []).map(i => ({
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
