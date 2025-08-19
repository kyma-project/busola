import { useTranslation } from 'react-i18next';

import { ItemArray } from 'shared/ResourceForm/fields';
import { createContainerTemplate } from './templates';
import { SingleContainerForm } from './Containers';

export const ContainersSection = ({ readOnly, tooltipContent, ...props }) => {
  const { t } = useTranslation();

  return (
    <ItemArray
      defaultOpen
      listTitle={t('jobs.create-modal.containers')}
      nameSingular={t('jobs.create-modal.container')}
      entryTitle={container => container?.name}
      tooltipContent={tooltipContent}
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
