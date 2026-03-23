import { useTranslation } from 'react-i18next';

import { ItemArray } from 'shared/ResourceForm/fields';
import { createContainerTemplate } from './templates';
import { SingleContainerForm } from './Containers';
import { RefObject } from 'react';

interface ContainersSectionProps {
  readOnly?: boolean;
  tooltipContent?: string;
  defaultOpen?: boolean;
  value?: any[];
  propertyPath?: string;
  inputRef?: RefObject<HTMLInputElement>;
  setValue?: (value: any[]) => void;
}

export const ContainersSection = ({
  readOnly,
  tooltipContent,
  defaultOpen = true,
  value,
  propertyPath,
  inputRef,
  setValue,
}: ContainersSectionProps) => {
  const { t } = useTranslation();
  return (
    <ItemArray
      defaultOpen={defaultOpen}
      value={value}
      setValue={setValue}
      inputRef={inputRef}
      propertyPath={propertyPath}
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
