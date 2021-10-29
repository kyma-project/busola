import React from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { Button, MessageStrip } from 'fundamental-react';

import {
  ResourceForm,
  ResourceFormWrapper,
} from 'shared/ResourceForm/ResourceForm';

import { createContainerTemplate } from './templates';
import { SingleContainerForm, SingleContainerInput } from './Containers';
import './ContainersSection.scss';

export const ContainersSection = ({ resource, setResource }) => {
  const { t } = useTranslation();

  return (
    <ResourceFormWrapper resource={resource} setResource={setResource}>
      <ResourceForm.ItemArray
        advanced
        propertyPath="$.template.spec.containers"
        listTitle={t('jobs.create-modal.containers')}
        nameSingular={t('jobs.create-modal.container')}
        entryTitle={container => container?.name}
        atLeastOneRequiredMessage={t(
          'jobs.create-modal.at-least-one-container-required',
        )}
        itemRenderer={(current, allValues, setAllValues) => (
          <SingleContainerForm
            container={current}
            containers={allValues}
            setContainers={setAllValues}
            advanced
          />
        )}
        newResourceTemplateFn={createContainerTemplate}
      />
    </ResourceFormWrapper>
  );
};

export const ContainerSection = ({ resource, setResource }) => {
  const { t } = useTranslation();

  return (
    <ResourceFormWrapper resource={resource} setResource={setResource}>
      {jp.value(resource, '$.template.spec.containers.length') ? (
        <SingleContainerInput
          simple
          propertyPath="$.template.spec.containers"
        />
      ) : (
        <div className="job-container__message">
          <MessageStrip simple type="warning" className="fd-margin-top--sm">
            {t('jobs.create-modal.at-least-one-container-required')}
            <Button
              glyph="add"
              compact
              onClick={() => {
                jp.value(resource, '$.template.spec.containers', [
                  createContainerTemplate(),
                ]);
                setResource(resource);
              }}
            >
              Add container
            </Button>
          </MessageStrip>
        </div>
      )}
    </ResourceFormWrapper>
  );
};
