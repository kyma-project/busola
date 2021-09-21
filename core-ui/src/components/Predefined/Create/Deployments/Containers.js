import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from '../../../../shared/ResourceForm/ResourceForm';
import * as jp from 'jsonpath';
import { Dropdown, K8sNameInput } from 'react-shared';
import {
  Button,
  FormFieldset,
  FormInput,
  FormItem,
  FormLabel,
  MessageStrip,
} from 'fundamental-react';
import './Containers.scss';

function MemoryInput({ label, value = '', setValue }) {
  const units = ['K', 'Ki', 'M', 'Mi', 'G', 'Gi', 'Ti', 'T'];
  const options = [
    { key: '', text: 'B' },
    ...units.map(e => ({
      key: e,
      text: e,
    })),
  ];

  value = value.toString();
  const numericValue = value.match(/^\d*(\.\d*)?/)[0];
  const unit = value.replace(numericValue, '');
  const selectedUnit = units.includes(unit) ? unit : '';

  return (
    <FormItem>
      <FormLabel required>{label}</FormLabel>
      <div className="memory-input">
        <FormInput
          compact
          type="number"
          min="0"
          required
          value={numericValue}
          onChange={e => setValue(e.target.value + selectedUnit)}
        />
        <Dropdown
          compact
          options={options}
          selectedKey={selectedUnit}
          onSelect={(_, { key }) => setValue(numericValue.toString() + key)}
        />
      </div>
    </FormItem>
  );
}

function CpuInput({ label, value = '', setValue }) {
  value = value.toString();
  if (value.endsWith('m')) {
    value = value.replace(/m/, '');
  } else {
    // convert from full units to milis
    value *= 1000;
  }

  return (
    <FormItem>
      <FormLabel required>{label} (m)</FormLabel>
      <ResourceForm.Input
        type="number"
        min="0"
        required
        value={value}
        setValue={value => setValue(value + 'm')}
      />
    </FormItem>
  );
}

function SingleContainerSection({ container, containers, setContainers }) {
  const { t, i18n } = useTranslation();

  return (
    <>
      <ResourceForm.FormField
        label={t('common.headers.name')}
        value={container.name}
        setValue={e => {
          container.name = e.target.value;
          setContainers([...containers]);
        }}
        required
        input={(value, onChange) => (
          <K8sNameInput
            value={value}
            onChange={onChange}
            compact
            required
            showLabel={false}
            i18n={i18n}
            kind={t('deployments.create-modal.advanced.image')}
          />
        )}
      />
      <ResourceForm.FormField
        label={t('deployments.create-modal.simple.docker-image')}
        value={container.image}
        setValue={image => {
          container.image = image;
          setContainers([...containers]);
        }}
        required
        input={(value, setValue) => (
          <ResourceForm.Input
            required
            value={value}
            setValue={setValue}
            placeholder={t(
              'deployments.create-modal.simple.docker-image-placeholder',
            )}
          />
        )}
        className="fd-margin-bottom--sm"
      />

      <ResourceForm.CollapsibleSection
        title={t('deployments.create-modal.advanced.runtime-profile')}
        canChangeState={false}
        defaultOpen
      >
        <FormFieldset className="runtime-profile-form">
          <MemoryInput
            label={t('deployments.create-modal.advanced.memory-requests')}
            value={jp.value(container, '$.resources.requests.memory') || ''}
            setValue={memory => {
              jp.value(container, '$.resources.requests.memory', memory);
              setContainers([...containers]);
            }}
          />
          <MemoryInput
            label={t('deployments.create-modal.advanced.memory-limits')}
            value={jp.value(container, '$.resources.limits.memory') || ''}
            setValue={memory => {
              jp.value(container, '$.resources.limits.memory', memory);
              setContainers([...containers]);
            }}
          />
        </FormFieldset>
        <FormFieldset className="runtime-profile-form">
          <CpuInput
            label={t('deployments.create-modal.advanced.cpu-requests')}
            value={jp.value(container, '$.resources.requests.cpu') || ''}
            setValue={cpu => {
              jp.value(container, '$.resources.requests.cpu', cpu);
              setContainers([...containers]);
            }}
          />
          <CpuInput
            label={t('deployments.create-modal.advanced.cpu-limits')}
            value={jp.value(container, '$.resources.limits.cpu') || ''}
            setValue={cpu => {
              jp.value(container, '$.resources.limits.cpu', cpu);
              setContainers([...containers]);
            }}
          />
        </FormFieldset>
      </ResourceForm.CollapsibleSection>
    </>
  );
}

export function Containers({ value: containers, setValue: setContainers }) {
  const { t } = useTranslation();

  const removeContainer = index => {
    setContainers(containers.filter((_, i) => index !== i));
  };

  containers = containers || [];

  if (!containers.length) {
    return (
      <MessageStrip type="warning">
        {t('deployments.create-modal.advanced.one-container-required')}
      </MessageStrip>
    );
  }

  if (containers.length === 1) {
    return (
      <SingleContainerSection
        container={containers[0]}
        containers={containers}
        setContainers={setContainers}
      />
    );
  }

  return containers.map((container, i) => (
    <ResourceForm.CollapsibleSection
      key={i}
      title={t('deployments.create-modal.advanced.container-header', {
        name: container?.name || i + 1,
      })}
      actions={
        <Button
          glyph="delete"
          type="negative"
          compact
          onClick={() => removeContainer(i)}
        />
      }
    >
      <SingleContainerSection
        container={container || {}}
        containers={containers}
        setContainers={setContainers}
      />
    </ResourceForm.CollapsibleSection>
  ));
}
