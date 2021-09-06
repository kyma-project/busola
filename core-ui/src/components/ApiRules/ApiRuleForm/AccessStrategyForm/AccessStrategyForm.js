import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Button,
  FormGroup,
  FormInput,
  FormItem,
  Checkbox,
  FormFieldset,
  FormRadioGroup,
  MessageStrip,
} from 'fundamental-react';
import { Tooltip, Dropdown } from 'react-shared';
import { useTranslation } from 'react-i18next';

import StringListInput from './StringListInput';
import JwtDetails from './JwtDetails/JwtDetails';
import accessStrategyTypes, {
  usesMethods,
  supportedMethodsList,
  hasValidMethods,
} from 'components/ApiRules/accessStrategyTypes';

export default function AccessStrategyForm({
  strategy,
  setStrategy,
  removeStrategy,
  canDelete,
  handleFormChanged,
}) {
  const selectedType = strategy.accessStrategies[0].handler;
  const { t, i18n } = useTranslation();

  const deleteButtonWrapper = canDelete
    ? component => component
    : component => (
        <div>
          <Tooltip content={t('api-rules.access-strategies.tooltips.delete')}>
            {component}
          </Tooltip>
        </div>
      );

  const options = Object.values(accessStrategyTypes).map(ac => ({
    key: ac.value,
    text: ac.displayName,
  }));

  const handleStrategyChange = (_, selected) => {
    const newStrategy = {
      ...strategy,
      accessStrategies: [
        {
          ...strategy.accessStrategies[0],
          handler: selected.key,
        },
      ],
    };
    // strategy type changed, reset current values
    if (selected.key !== strategy.accessStrategies[0].handler) {
      newStrategy.accessStrategies[0].config = {};
    }
    setStrategy(newStrategy);
    handleFormChanged();
  };

  return (
    <div role="row">
      <div className="access-strategy access-strategy--form">
        <div className="content">
          <FormGroup>
            <FormItem style={{ marginRight: '0.5rem' }}>
              <Tooltip content={t('api-rules.access-strategies.tooltips.path')}>
                <FormInput
                  placeholder="Enter the path"
                  type="text"
                  value={strategy.path}
                  required
                  aria-label="Access strategy path"
                  pattern="^[a-z0-9\/\(\)\?.!*\-]+"
                  onChange={e =>
                    setStrategy({ ...strategy, path: e.target.value })
                  }
                />
              </Tooltip>
            </FormItem>
            <FormItem>
              <Dropdown
                id="access-strategies-dropdown"
                options={options}
                selectedKey={selectedType}
                onSelect={handleStrategyChange}
                i18n={i18n}
              />
            </FormItem>
            <MethodsForm
              methods={strategy.methods}
              setMethods={methods => setStrategy({ ...strategy, methods })}
              isRelevant={usesMethods(selectedType)}
            ></MethodsForm>
          </FormGroup>

          <Details
            {...strategy.accessStrategies[0]}
            setConfig={config =>
              setStrategy({
                ...strategy,
                accessStrategies: [{ ...strategy.accessStrategies[0], config }],
              })
            }
            handleFormChanged={handleFormChanged}
          />
        </div>
        {deleteButtonWrapper(
          <Button
            glyph="delete"
            type="negative"
            typeAttr="button"
            className="remove-access-strategy fd-margin-begin--md"
            aria-label="remove-access-strategy"
            onClick={removeStrategy}
            disabled={!canDelete}
          />,
        )}
      </div>
      {!hasValidMethods(strategy) && (
        <MessageStrip type="warning" className="fd-margin-bottom--md">
          {t('api-rules.access-strategies.messages.one-method')}
        </MessageStrip>
      )}
    </div>
  );
}

AccessStrategyForm.propTypes = {
  strategy: PropTypes.object.isRequired,
  setStrategy: PropTypes.func.isRequired,
  removeStrategy: PropTypes.func.isRequired,
  canDelete: PropTypes.bool.isRequired,
  handleFormChanged: PropTypes.func.isRequired,
};

function Details({ handler, ...props }) {
  switch (handler) {
    case accessStrategyTypes.oauth2_introspection.value:
      return <OAuth2Details {...props} />;
    case accessStrategyTypes.jwt.value:
      return <JwtDetails {...props} />;
    default:
      return null;
  }
}

function OAuth2Details({ config, setConfig }) {
  const { t } = useTranslation();
  return (
    <StringListInput
      list={config?.required_scope || []}
      onChange={scopes => setConfig({ required_scope: scopes })}
      isEditMode={true}
      label={t('api-rules.access-strategies.labels.required-scope')}
      regexp={/^[^, ]+$/}
    />
  );
}

function MethodsForm({ methods, setMethods, isRelevant }) {
  const AVAILABLE_METHODS = supportedMethodsList;
  const toggleMethod = function(method, checked) {
    if (checked) {
      setMethods([...methods, method]);
    } else {
      const removeIdx = methods.indexOf(method);
      setMethods([
        ...methods.slice(0, removeIdx),
        ...methods.slice(removeIdx + 1, methods.length),
      ]);
    }
  };
  return (
    <FormFieldset className={classNames({ 'fd-hidden': !isRelevant })}>
      <FormRadioGroup inline className="inline-radio-group">
        {AVAILABLE_METHODS.map(m => (
          <Checkbox
            key={m}
            value={m}
            defaultChecked={methods.includes(m)}
            onChange={e => toggleMethod(m, e.target.checked)}
            style={{ marginBottom: '0.5rem' }}
          >
            {m}
          </Checkbox>
        ))}
      </FormRadioGroup>
    </FormFieldset>
  );
}
