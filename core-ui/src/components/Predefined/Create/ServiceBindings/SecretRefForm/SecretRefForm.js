import React from 'react';
import { Dropdown, Tooltip } from 'react-shared';
import { Button, Icon, MessageStrip } from 'fundamental-react';
import { v4 as uuid } from 'uuid';
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
    <Tooltip className="validation-message" content={message}>
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
  refs,
  setRefs,
  setRefsValid = () => {},
  secrets,
  loading,
  error,
}) {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (Array.isArray(refs)) {
      setRefsValid(refs.every(ref => !getRefValidation(ref, refs)));
    } else {
      setRefsValid(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refs]);

  if (!Array.isArray(refs)) {
    return (
      <MessageStrip type="error">
        {t('btp-service-bindings.create.ref-form.parametersFrom-must-be-array')}
      </MessageStrip>
    );
  }

  const secretNames = (secrets || [])
    .map(s => s.metadata.name)
    .map(n => ({ key: n, text: n }));

  const addRef = () => {
    setRefs([...refs, { secretKeyRef: { name: '', key: '' } }]);
  };

  const removeRef = index => {
    setRefs(refs.filter((_, i) => i !== index));
  };

  const getSecretKeys = secretName => {
    const secret = secrets.find(s => s.metadata.name === secretName);
    if (secret?.data) {
      return Object.keys(secret.data).map(key => ({ key, text: key }));
    }
    return [];
  };

  const getSecretValue = ref => {
    const secret = secrets.find(s => s.metadata.name === ref.secretKeyRef.name);
    return secret?.data
      ? tryBase64Decode(secret.data[ref.secretKeyRef.key])
      : '';
  };

  const getRefValidation = (ref, otherRefs) => {
    try {
      if (!ref.secretKeyRef.name) {
        return t('btp-service-bindings.create.ref-form.choose-secret');
      } else if (!ref.secretKeyRef.key) {
        return t('btp-service-bindings.create.ref-form.choose-key');
      } else if (!isValidJSONObject(getSecretValue(ref))) {
        return t(
          'btp-service-bindings.create.ref-form.value-must-be-json-object',
        );
      }

      const duplicates = otherRefs.filter(
        r =>
          r.secretKeyRef.name === ref.secretKeyRef.name &&
          r.secretKeyRef.key === ref.secretKeyRef.key,
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

  const addRefButton = () => {
    const text = t('common.buttons.add-new');
    if (loading || error) {
      return (
        <Tooltip
          content={loading ? t('common.headers.loading') : error.message}
        >
          <Button glyph="add" disabled>
            {text}
          </Button>
        </Tooltip>
      );
    }
    return (
      <Button glyph="add" onClick={addRef}>
        {text}
      </Button>
    );
  };

  const onSecretSelect = ref => (_, selected) => {
    ref.secretKeyRef.name = selected.text;
    ref.secretKeyRef.key = '';
    setRefs([...refs]);
  };

  const onKeySelect = ref => (_, selected) => {
    ref.secretKeyRef.key = selected.text;
    setRefs([...refs]);
  };

  const renderRefs = refs
    .filter(ref => ref.secretKeyRef)
    .map(ref => ({
      ...ref,
      renderKey: uuid(),
      validationMessage: getRefValidation(ref, refs),
    }));

  return <MultiInput inputs={[]} />;
  /*
  return (
    <>
      <ul className="secret-ref-form">
        {renderRefs.map((ref, index) => (
          <li key={ref.renderKey}>
            <RefValidationMessage message={ref.validationMessage} />
            <Dropdown
              id="secret-dropdown"
              options={secretNames}
              selectedKey={ref.secretKeyRef.name}
              onSelect={onSecretSelect(ref)}
              placeholder={t(
                'btp-service-bindings.create.ref-form.choose-secret',
              )}
            />
            {ref.secretKeyRef.name ? (
              <Dropdown
                id="secret-dropdown"
                options={getSecretKeys(ref.secretKeyRef.name)}
                selectedKey={ref.secretKeyRef.key}
                onSelect={onKeySelect(ref)}
                placeholder={t(
                  'btp-service-bindings.create.ref-form.choose-secret-key',
                )}
                emptyListMessage={t(
                  'btp-service-bindings.create.ref-form.empty-secret',
                )}
              />
            ) : (
              <Dropdown
                disabled
                placeholder={t(
                  'btp-service-bindings.create.ref-form.choose-secret-first',
                )}
              />
            )}
            <textarea
              disabled
              value={ref.secretKeyRef.key && getSecretValue(ref)}
            />
            <Button
              glyph="delete"
              type="negative"
              onClick={() => removeRef(index)}
            />
          </li>
        ))}
      </ul>
      <div className="ref-button-wrapper">{addRefButton()}</div>
    </>
  );
  */
}
