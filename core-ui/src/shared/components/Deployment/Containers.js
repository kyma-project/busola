import React from 'react';
import { useTranslation } from 'react-i18next';
import { K8sNameInput } from 'react-shared';

import { Button, MessageStrip } from 'fundamental-react';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { RuntimeResources } from 'shared/ResourceForm/components/RuntimeResources';

import './Containers.scss';

function SingleContainerSection({ container, setContainer }) {
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
      />
      <RuntimeResources
        title={t('deployments.create-modal.advanced.runtime-profile')}
        propertyPath="$.resources"
        canChangeState={false}
        defaultOpen
      />
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
