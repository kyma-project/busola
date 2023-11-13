import { Dropdown as BusolaDropown } from 'shared/components/Dropdown/Dropdown';
import { useTranslation } from 'react-i18next';

export function Dropdown({ value, setValue, error, loading, ...props }) {
  const { t } = useTranslation();

  const getValidationState = () => {
    if (error) {
      return {
        state: 'error',
        text: t('common.messages.error', { error: error.message }),
      };
    } else if (loading) {
      return {
        state: 'information',
        text: t('common.headers.loading'),
      };
    } else {
      return null;
    }
  };

  const {
    inputRef,
    validate,
    validationRef,
    setResource,
    ...dropdownProps
  } = props;
  return (
    <div className="bsl-col bsl-col-md--11">
      <BusolaDropown
        selectedKey={value}
        onSelect={(_, selected) => setValue(selected.key, selected)}
        validationState={getValidationState()}
        {...dropdownProps}
      />
    </div>
  );
}
