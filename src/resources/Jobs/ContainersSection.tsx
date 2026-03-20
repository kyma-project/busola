import { useTranslation } from 'react-i18next';

import { ItemArray } from 'shared/ResourceForm/fields';
import { createContainerTemplate } from './templates';
import { SingleContainerForm } from './Containers';

interface ContainersSectionProps {
  readOnly?: boolean;
  tooltipContent?: string;
  defaultOpen?: boolean;
}

export const ContainersSection = ({
  readOnly,
  tooltipContent,
  defaultOpen = true,
}: ContainersSectionProps) => {
  const { t } = useTranslation();

  return (
    <ItemArray
      defaultOpen={defaultOpen}
      listTitle={t('jobs.create-modal.containers')}
      nameSingular={t('jobs.create-modal.container')}
      entryTitle={(container) => container?.name}
      tooltipContent={tooltipContent}
      atLeastOneRequiredMessage={t(
        'jobs.create-modal.at-least-one-container-required',
      )}
      itemRenderer={({
        item,
        values,
        setValues,
      }: {
        item: Record<string, any>;
        values?: Record<string, any>[];
        setValues?: (vals: Record<string, any>[]) => void;
      }) => (
        <SingleContainerForm
          container={item}
          containers={values}
          setContainers={setValues}
          readOnly={readOnly}
        />
      )}
      newResourceTemplateFn={createContainerTemplate}
      readOnly={readOnly}
    />
  );
};
