import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from './../ResourceForm/ResourceForm';
import * as jp from 'jsonpath';
import {
  Button,
  FormFieldset,
  FormItem,
  FormLabel,
  MessageStrip,
} from 'fundamental-react';

function SingleContainerSection({ container, containers, setContainers }) {
  const { t } = useTranslation();

  return (
    <>
      <ResourceForm.FormField
        label={t('common.headers.name')}
        value={container.name}
        setValue={name => {
          container.name = name;
          setContainers([...containers]);
        }}
        required
        input={(value, onChange) => (
          <ResourceForm.Input required value={value} setValue={onChange} />
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
        input={(value, onChange) => (
          <ResourceForm.Input required value={value} setValue={onChange} />
        )}
        className="fd-margin-bottom--sm"
      />

      <ResourceForm.CollapsibleSection
        title={t('deployments.create-modal.advanced.runtime-profile')}
        canChangeState={false}
        defaultOpen
      >
        <FormFieldset className="runtime-profile-form">
          <FormItem>
            <FormLabel required>
              {t('deployments.create-modal.advanced.memory-requests')}
            </FormLabel>
            <ResourceForm.Input
              required
              value={jp.value(container, '$.resources.requests.memory') || ''}
              setValue={memory => {
                jp.value(container, '$.resources.requests.memory', memory);
                setContainers([...containers]);
              }}
            />
          </FormItem>
          <FormItem>
            <FormLabel required>
              {t('deployments.create-modal.advanced.memory-limits')}
            </FormLabel>
            <ResourceForm.Input
              required
              value={jp.value(container, '$.resources.limits.memory') || ''}
              setValue={memory => {
                jp.value(container, '$.resources.limits.memory', memory);
                setContainers([...containers]);
              }}
            />
          </FormItem>
        </FormFieldset>
        <FormFieldset className="runtime-profile-form">
          <FormItem>
            <FormLabel required>
              {t('deployments.create-modal.advanced.cpu-requests')}
            </FormLabel>
            <ResourceForm.Input
              required
              value={jp.value(container, '$.resources.requests.cpu') || ''}
              setValue={cpu => {
                jp.value(container, '$.resources.requests.cpu', cpu);
                setContainers([...containers]);
              }}
            />
          </FormItem>
          <FormItem>
            <FormLabel required>
              {t('deployments.create-modal.advanced.cpu-limits')}
            </FormLabel>
            <ResourceForm.Input
              required
              value={jp.value(container, '$.resources.limits.cpu') || ''}
              setValue={cpu => {
                jp.value(container, '$.resources.limits.cpu', cpu);
                setContainers([...containers]);
              }}
            />
          </FormItem>
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
        name: container.name || i + 1,
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
        container={container}
        containers={containers}
        setContainers={setContainers}
      />
    </ResourceForm.CollapsibleSection>
  ));
}
