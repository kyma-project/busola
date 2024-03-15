import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { Button, MessageStrip } from '@ui5/webcomponents-react';

import { ItemArray } from 'shared/ResourceForm/fields';
import { createContainerTemplate } from './templates';
import { SingleContainerForm, SingleContainerInput } from './Containers';

import { spacing } from '@ui5/webcomponents-react-base';

export const ContainersSection = ({ readOnly, ...props }) => {
  const { t } = useTranslation();

  return (
    <ItemArray
      listTitle={t('jobs.create-modal.containers')}
      nameSingular={t('jobs.create-modal.container')}
      entryTitle={container => container?.name}
      atLeastOneRequiredMessage={t(
        'jobs.create-modal.at-least-one-container-required',
      )}
      itemRenderer={({ item, values, setValues }) => (
        <SingleContainerForm
          container={item}
          containers={values}
          setContainers={setValues}
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
    <MessageStrip
      design="Warning"
      hideCloseButton
      style={spacing.sapUiSmallMarginTop}
    >
      {t('jobs.create-modal.at-least-one-container-required')}
      <Button
        icon="add"
        iconEnd
        disabled={readOnly}
        onClick={() => {
          jp.value(value, '$[0]', createContainerTemplate());
          setValue(value);
        }}
        design="Transparent"
      >
        {t('deployment.create-modal.add-container')}
      </Button>
    </MessageStrip>
  );
};
