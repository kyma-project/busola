import React from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { Button, MessageStrip } from 'fundamental-react';

import { ItemArray } from 'shared/ResourceForm/fields';
import { createContainerTemplate } from './templates';
import { SingleContainerForm, SingleContainerInput } from './Containers';
import './ContainersSection.scss';

export const ContainersSection = ({ readOnly, ...props }) => {
  const { t } = useTranslation();

  return (
    <ItemArray
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
          readOnly={readOnly}
        />
      )}
      newResourceTemplateFn={createContainerTemplate}
      readOnly={readOnly}
      {...props}
    />
  );
};

export const ContainerSection = ({ readOnly, ...props }) => {
  const { t } = useTranslation();
  const { value = [], setValue } = props;

  return value?.length ? (
    <SingleContainerInput simple readOnly={readOnly} {...props} />
  ) : (
    <div className="job-container__message">
      <MessageStrip type="warning" className="fd-margin-top--sm">
        {t('jobs.create-modal.at-least-one-container-required')}
        <Button
          glyph="add"
          compact
          disabled={readOnly}
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
