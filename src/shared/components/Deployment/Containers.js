import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { K8sNameField } from 'shared/ResourceForm/fields';

import { Button, MessageStrip } from '@ui5/webcomponents-react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { RuntimeResources } from 'shared/ResourceForm/fields';

function SingleContainerSection({ container, setContainer }) {
  const { t } = useTranslation();

  return (
    <ResourceForm.Wrapper resource={container} setResource={setContainer}>
      <K8sNameField
        propertyPath="$.name"
        setValue={name => {
          jp.value(container, '$.name', name);
          setContainer(container);
        }}
        required
        kind={t('deployments.create-modal.advanced.image')}
        pattern=".*"
        showHelp={false}
      />
      <ResourceForm.FormField
        required
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
        nestingLevel={1}
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
      <MessageStrip design="Warning" hideCloseButton>
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
      nestingLevel={1}
      key={i}
      title={t('deployments.create-modal.advanced.container-header', {
        name: container?.name || i + 1,
      })}
      actions={
        <Button
          icon="delete"
          design="Transparent"
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
