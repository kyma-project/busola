import React from 'react';
import { Dropdown, Tooltip } from 'react-shared';
import { Button, Icon } from 'fundamental-react';
import { v4 as uuid } from 'uuid';
import './SecretRefFrom.scss';
import { base64Decode } from 'shared/helpers';

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
  setRefsValid,
  secrets,
  loading,
  error,
}) {
  const secretNames = (secrets || [])
    .map(s => s.metadata.name)
    .map(n => ({ key: n, text: n }));

  React.useEffect(() => {
    setRefsValid(refs.every(ref => !getRefValidation(ref, refs)));
  }, [refs]);

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
    if (!ref.secretKeyRef.name) {
      return 'Choose a Secret.';
    } else if (!ref.secretKeyRef.key) {
      return 'Choose Secret key.';
    } else if (!isValidJSONObject(getSecretValue(ref))) {
      return 'Secret data value must be a JSON object.';
    }

    const duplicates = otherRefs.filter(
      r =>
        r.secretKeyRef.name === ref.secretKeyRef.name &&
        r.secretKeyRef.key === ref.secretKeyRef.key,
    );

    if (duplicates.length > 1) {
      return 'This ref already exists.';
    }
    return '';
  };

  const addRefButton = () => {
    if (loading || error) {
      return (
        <Tooltip content={loading ? 'Loading...' : error.message}>
          <Button glyph="add" disabled>
            Add new
          </Button>
        </Tooltip>
      );
    }
    return (
      <Button glyph="add" onClick={addRef}>
        Add new
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

  const renderRefs = refs.map(ref => ({
    ...ref,
    renderKey: uuid(),
    validationMessage: getRefValidation(ref, refs),
  }));

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
              placeholder="Choose secret..."
            />
            {ref.secretKeyRef.name ? (
              <Dropdown
                id="secret-dropdown"
                options={getSecretKeys(ref.secretKeyRef.name)}
                selectedKey={ref.secretKeyRef.key}
                onSelect={onKeySelect(ref)}
                placeholder="Choose key..."
                emptyListMessage="This Secret has no data."
              />
            ) : (
              <Dropdown disabled placeholder="Choose secret first." />
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
}
