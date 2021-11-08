import React from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { Button, MessageStrip } from 'fundamental-react';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { createContainerTemplate } from './templates';
import { SingleContainerForm, SingleContainerInput } from './Containers';
import './ContainersSection.scss';

export const ContainersSection = ({ ...props }) => {
  const { t } = useTranslation();

  return (
    <ResourceForm.ItemArray
      advanced
      listTitle={t('jobs.create-modal.containers')}
      nameSingular={t('jobs.create-modal.container')}
      entryTitle={container => container?.name}
      atLeastOneRequiredMessage={t(
        'jobs.create-modal.at-least-one-container-required',
      )}
      itemRenderer={({ item, values, setValues, isAdvanced }) => (
        <SingleContainerForm
          container={item}
          containers={values}
          setContainers={setValues}
          isAdvanced={isAdvanced}
        />
      )}
      newResourceTemplateFn={createContainerTemplate}
      {...props}
    />
  );
};

export const ContainerSection = ({ ...props }) => {
  const { t } = useTranslation();
  const { value, setValue } = props;

  return value?.length ? (
    <SingleContainerInput simple {...props} />
  ) : (
    <div className="job-container__message">
      <MessageStrip type="warning" className="fd-margin-top--sm">
        {t('jobs.create-modal.at-least-one-container-required')}
        <Button
          glyph="add"
          compact
          onClick={() => {
            jp.value(value, '$[0]', createContainerTemplate());
            setValue(value);
          }}
        >
          Add container
        </Button>
      </MessageStrip>
    </div>
  );
};
