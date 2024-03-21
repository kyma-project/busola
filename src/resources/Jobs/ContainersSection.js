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
