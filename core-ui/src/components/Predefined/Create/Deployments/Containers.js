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

import * as Inputs from 'shared/ResourceForm/components/Inputs';

import './Containers.scss';

function MemoryInput({ label, propertyPath, container, setContainer }) {
  const units = ['', 'K', 'Ki', 'M', 'Mi', 'G', 'Gi', 'Ti', 'T'];
  const options = units.map(e => ({
    key: e,
    text: e,
  }));

  const value = jp.value(container, propertyPath).toString() || '';
  const numericValue = value.match(/^\d*(\.\d*)?/)[0];
  const unit = value.replace(numericValue, '');
  const selectedUnit = units.includes(unit) ? unit : '';

  const setValue = val => {
    jp.value(container, propertyPath, val);
    setContainer(container);
  };

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
          onSelect={(_, { text }) => setValue(numericValue.toString() + text)}
        />
      </div>
    </FormItem>
  );
}

function CpuInput({ label, propertyPath, container, setContainer }) {
  let value = jp.value(container, propertyPath).toString() || '';
  if (value.endsWith('m')) {
    value = value.replace(/m/, '');
  } else {
    // convert from full units to milis
    value *= 1000;
  }

  const setValue = val => {
    jp.value(container, propertyPath, val);
    setContainer(container);
  };

  return (
    <FormItem>
      <FormLabel required>{label} (m)</FormLabel>
      <Inputs.Number
        min="0"
        required
        value={value}
        setValue={value => setValue(value + 'm')}
      />
    </FormItem>
  );
}

function SingleContainerSection({
  container,
  setContainer,
  containers,
  setContainers,
}) {
  const { t, i18n } = useTranslation();

  return (
    <ResourceForm.Wrapper resource={container} setResource={setContainer}>
      <ResourceForm.FormField
        required
        label={t('common.headers.name')}
        propertyPath="$.name"
        input={({ value, setValue }) => (
          <K8sNameInput
            value={value}
            onChange={e => setValue(e.target.value)}
            compact
            required
            showLabel={false}
            i18n={i18n}
            kind={t('deployments.create-modal.advanced.image')}
          />
        )}
      />
      <ResourceForm.FormField
        required
        className="fd-margin-bottom--sm"
        propertyPath="$.image"
        label={t('deployments.create-modal.simple.docker-image')}
        input={Inputs.Text}
        placeholder={t(
          'deployments.create-modal.simple.docker-image-placeholder',
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
            propertyPath="$.resources.requests.memory"
            container={container}
            setContainer={setContainer}
          />
          <MemoryInput
            label={t('deployments.create-modal.advanced.memory-limits')}
            propertyPath="$.resources.limits.memory"
            container={container}
            setContainer={setContainer}
          />
        </FormFieldset>
        <FormFieldset className="runtime-profile-form">
          <CpuInput
            label={t('deployments.create-modal.advanced.cpu-requests')}
            propertyPath="$.resources.requests.cpu"
            container={container}
            setContainer={setContainer}
          />
          <CpuInput
            label={t('deployments.create-modal.advanced.cpu-limits')}
            propertyPath="$.resources.limits.cpu"
            container={container}
            setContainer={setContainer}
          />
        </FormFieldset>
      </ResourceForm.CollapsibleSection>
    </ResourceForm.Wrapper>
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
        setContainer={newContainer => {
          containers.splice(0, 1, newContainer);
          setContainers(containers);
        }}
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
        setContainer={newContainer => {
          containers.splice(i, 1, newContainer);
          setContainers(containers);
        }}
      />
    </ResourceForm.CollapsibleSection>
  ));
}
