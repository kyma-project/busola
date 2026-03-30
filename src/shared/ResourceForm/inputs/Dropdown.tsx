import { Dropdown as BusolaDropdown } from 'shared/components/Dropdown/Dropdown';
import { useTranslation } from 'react-i18next';

type DropdownProps = {
  value?: string;
  setValue: (key: string, selected: any) => void;
  error?: Error;
  loading?: boolean;
  selectedKey?: string;
  accessibleName?: string;
  options: { key: string; text: string }[];
  [key: string]: any;
};

export function Dropdown({
  value,
  setValue,
  error,
  loading,
  selectedKey,
  accessibleName,
  options,
  ...props
}: DropdownProps) {
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

  return (
    <BusolaDropdown
      selectedKey={selectedKey ?? value ?? ''}
      onSelect={(_: Event, selected: any) => setValue(selected.key, selected)}
      validationState={getValidationState()}
      accessibleName={
        accessibleName ? `${accessibleName} Dropdown input` : accessibleName
      }
      options={options}
      {...props}
    />
  );
}
