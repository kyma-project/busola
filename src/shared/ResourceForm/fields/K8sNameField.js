import { Label } from '../../../shared/ResourceForm/components/Label';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import { K8sNameInput } from 'shared/components/K8sNameInput/K8sNameInput';

import { useCreateResourceDescription } from 'components/Extensibility/helpers';

export function K8sNameField({
  kind,
  value,
  setValue,
  className,
  prefix,
  pattern,
  showHelp = true,
  inputInfo,
  tooltipContent,
  required = true,
  ...props
}) {
  const { t } = useTranslation();
  const { isAdvanced, propertyPath, validate, readOnly, ...inputProps } = props;
  const inputInfoLink = useCreateResourceDescription(inputInfo);

  return (
    <ResourceForm.FormField
      required={required}
      className={className}
      propertyPath="$.metadata.name"
      label={t('common.labels.name')}
      inputInfo={inputInfoLink}
      tooltipContent={tooltipContent}
      input={() => {
        return (
          <>
            <div className="bsl-col bsl-col-md--12">
              <K8sNameInput
                kind={kind}
                compact
                required={required}
                showLabel={false}
                onChange={e => setValue(e.target.value)}
                onInput={e => setValue(e.target.value)}
                value={value}
                readOnly={readOnly}
                pattern={pattern}
                {...inputProps}
              />
            </div>
            {showHelp && inputInfo === undefined ? (
              <Label wrappingType="Normal" style={{ marginTop: '5px' }}>
                {t('common.tooltips.k8s-name-input')}
              </Label>
            ) : null}
          </>
        );
      }}
    />
  );
}
