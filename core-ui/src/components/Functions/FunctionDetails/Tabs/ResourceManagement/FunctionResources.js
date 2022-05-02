import React, { useState, useEffect } from 'react';
import { LayoutPanel } from 'fundamental-react';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { useTranslation } from 'react-i18next';

import { Input } from './TableElements/Input';
import { Row } from './TableElements/Row';
import { CONFIG } from 'components/Functions/config';
import {
  ErrorMessage,
  inputClassName,
  inputNames as names,
  customPreset,
  isCustomPreset,
} from './shared';

export default function FunctionResources({
  disabledForm,
  register,
  errors = {},
  type = 'function',
  setValue = () => void 0,
  defaultPreset = customPreset,
}) {
  const { t, i18n } = useTranslation();
  const [currentPreset, setCurrentPreset] = useState(defaultPreset);

  useEffect(() => {
    if (disabledForm) {
      setCurrentPreset(defaultPreset);
    }
  }, [defaultPreset, disabledForm, setCurrentPreset]);

  const inputNames = names[type];
  const presets = CONFIG[`${type}ResourcesPresets`];

  const presetOptions = Object.entries(presets).map(([preset, values]) => ({
    text: `${preset} (${Object.entries(values)
      .map(([t, v]) => `${t}: ${v}`)
      .join(', ')})`,
    key: preset,
  }));
  presetOptions.push({
    text: t('functions.variable.type.custom'),
    key: customPreset,
  });

  async function onChangePreset(selected) {
    const preset = selected.key;
    if (preset) {
      if (presets && preset !== customPreset) {
        const values = presets[preset];
        setValue(inputNames.requests.memory, values.requestMemory);
        setValue(inputNames.requests.cpu, values.requestCpu);
        setValue(inputNames.limits.memory, values.limitMemory);
        setValue(inputNames.limits.cpu, values.limitCpu);
      }
      setCurrentPreset(preset);
    }
  }

  let isHidden = !isCustomPreset(currentPreset);

  return (
    <>
      <LayoutPanel
        className={`has-box-shadow-none presets${
          isHidden ? ' has-no-margin-bottom' : ''
        }`}
      >
        <LayoutPanel.Body className="has-padding-none">
          <Row
            action={
              <Dropdown
                disabled={disabledForm}
                options={presetOptions}
                selectedKey={defaultPreset}
                id={inputNames.preset}
                name={inputNames.preset}
                onSelect={(_, selected) => onChangePreset(selected)}
                i18n={i18n}
              />
            }
          />
        </LayoutPanel.Body>
      </LayoutPanel>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridGap: '1rem',
        }}
        className={isHidden ? 'hidden-panel' : ''}
      >
        <LayoutPanel className="has-box-shadow-none">
          <LayoutPanel.Header className="has-padding-none has-none-border-bottom">
            <LayoutPanel.Head
              title={t('functions.details.title.requests')}
              description={t('functions.details.descriptions.requests')}
            />
          </LayoutPanel.Header>
          <LayoutPanel.Body className="has-padding-none">
            <Row
              title={t('functions.details.title.memory')}
              action={
                <>
                  <Input
                    className={inputClassName}
                    disabled={disabledForm}
                    {...register(inputNames.requests.memory)}
                    id={inputNames.requests.memory}
                    name={inputNames.requests.memory}
                    placeholder={t('functions.details.title.memory')}
                  />
                  <ErrorMessage
                    errors={errors}
                    field={inputNames.requests.memory}
                  />
                </>
              }
            />
            <Row
              title={t('functions.details.title.cpu')}
              action={
                <>
                  <Input
                    disabled={disabledForm}
                    className={inputClassName}
                    id={inputNames.requests.cpu}
                    name={inputNames.requests.cpu}
                    {...register(inputNames.requests.cpu)}
                    placeholder={t('functions.details.title.cpu')}
                  />
                  <ErrorMessage
                    errors={errors}
                    field={inputNames.requests.cpu}
                  />
                </>
              }
            />
          </LayoutPanel.Body>
        </LayoutPanel>
        <LayoutPanel className="has-box-shadow-none">
          <LayoutPanel.Header className="has-padding-none has-none-border-bottom">
            <LayoutPanel.Head
              title={t('functions.details.title.limits')}
              description={t('functions.details.descriptions.limits')}
            />
          </LayoutPanel.Header>
          <LayoutPanel.Body className="has-padding-none">
            <Row
              title={t('functions.details.title.memory')}
              action={
                <>
                  <Input
                    disabled={disabledForm}
                    className={inputClassName}
                    id={inputNames.limits.memory}
                    name={inputNames.limits.memory}
                    {...register(inputNames.limits.memory)}
                    placeholder={t('functions.details.title.memory')}
                  />
                  <ErrorMessage
                    errors={errors}
                    field={inputNames.limits.memory}
                  />
                </>
              }
            />
            <Row
              title={t('functions.details.title.cpu')}
              action={
                <>
                  <Input
                    id={inputNames.limits.cpu}
                    name={inputNames.limits.cpu}
                    disabled={disabledForm}
                    className={inputClassName}
                    placeholder={t('functions.details.title.cpu')}
                    {...register(inputNames.requests.cpu)}
                  />
                  <ErrorMessage errors={errors} field={inputNames.limits.cpu} />
                </>
              }
            />
          </LayoutPanel.Body>
        </LayoutPanel>
      </div>
    </>
  );
}
