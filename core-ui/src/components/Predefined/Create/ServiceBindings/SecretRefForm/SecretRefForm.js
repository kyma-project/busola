import React from 'react';
import { Dropdown, Tooltip } from 'react-shared';
import { Icon, FormTextarea } from 'fundamental-react';
import './SecretRefFrom.scss';
import { base64Decode } from 'shared/helpers';
import { useTranslation } from 'react-i18next';

import { MultiInput } from 'shared/ResourceForm/components/FormComponents';

const isValidJSONObject = value => {
  try {
    const parsed = JSON.parse(value);
    return !!parsed && typeof parsed === 'object';
  } catch (_) {
    return false;
  }
};

const tryBase64Decode = value => {
  try {
    return base64Decode(value);
  } catch (_) {
    return '';
  }
};

const RefValidationMessage = ({ message }) => {
  return message ? (
    <Tooltip className="validation-message" content={message} delay={[0, 0]}>
      <Icon
        size="l"
        className="ref-validation-icon"
        glyph="message-warning"
        ariaLabel="ref warning message"
      />
    </Tooltip>
  ) : (
    <div className="validation-message" />
  );
};

export function SecretRefForm({
  secrets,
  loading,
  error,
  value: secretRefs,
  setValue: setSecretRefs,
}) {
  const { t } = useTranslation();

  const secretNames = (secrets || [])
    .map(s => s.metadata.name)
    .map(n => ({ key: n, text: n }));

  const getSecretKeys = secretName => {
    const secret = secrets.find(s => s.metadata.name === secretName);
    if (secret?.data) {
      return Object.keys(secret.data).map(key => ({ key, text: key }));
    }
    return [];
  };

  const getSecretValue = ref => {
    if (!ref?.name) {
      return '';
    }
    const secret = secrets.find(s => s.metadata.name === ref.name);
    return secret?.data ? tryBase64Decode(secret.data[ref.key]) : '';
  };

  const getRefValidation = (ref, otherRefs) => {
    try {
      if (!ref) {
        return '';
      } else if (!ref.name) {
        return t('btp-service-bindings.create.ref-form.choose-secret');
      } else if (!ref.key) {
        return t('btp-service-bindings.create.ref-form.choose-key');
      } else if (!isValidJSONObject(getSecretValue(ref))) {
        return t(
          'btp-service-bindings.create.ref-form.value-must-be-json-object',
        );
      }

      const duplicates = otherRefs.filter(
        r => r.name === ref.name && r.key === ref.key,
      );

      if (duplicates.length > 1) {
        return t('btp-service-bindings.create.ref-form.duplicate-ref');
      }
    } catch (e) {
      console.warn(e);
      return t('btp-service-bindings.create.ref-form.invalid-ref');
    }
    return '';
  };

  return (
    <MultiInput
      fullWidth
      toInternal={value =>
        (Array.isArray(value) ? value : []).map(val => val.secretKeyRef)
      }
      toExternal={value =>
        value.filter(val => !!val).map(val => ({ secretKeyRef: val }))
      }
      value={secretRefs}
      setValue={setSecretRefs}
      className="secret-ref-form"
      title={t('btp-service-bindings.parameters-from')}
      inputs={[
        ({ value }) => {
          const validationMessage = getRefValidation(value, secretRefs);
          return <RefValidationMessage message={validationMessage} />;
        },
        ({ value, setValue, ref, onBlur, focus }) => (
          <Dropdown
            compact
            className="secret-name-dropdown"
            options={secretNames}
            selectedKey={value?.name}
            ref={ref}
            onSelect={(e, selected) => {
              setValue({ name: selected.key });
              onBlur();
              focus(e);
            }}
            placeholder={t(
              'btp-service-bindings.create.ref-form.choose-secret',
            )}
          />
        ),
        ({ value, setValue, ref, onBlur, focus }) =>
          value?.name ? (
            <Dropdown
              compact
              className="secret-key-dropdown"
              options={getSecretKeys(value.name)}
              selectedKey={value.key}
              onSelect={(e, selected) => {
                setValue({ ...value, key: selected.key });
                onBlur();
                focus(e);
              }}
              placeholder={t(
                'btp-service-bindings.create.ref-form.choose-secret-key',
              )}
              emptyListMessage={t(
                'btp-service-bindings.create.ref-form.empty-secret',
              )}
            />
          ) : (
            <Dropdown
              compact
              disabled
              className="secret-key-dropdown"
              placeholder={t(
                'btp-service-bindings.create.ref-form.choose-secret-first',
              )}
            />
          ),
        ({ value }) => (
          <FormTextarea
            compact
            disabled
            className="secret-content"
            value={getSecretValue(value)}
          />
        ),
      ]}
    />
  );
}
