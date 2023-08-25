import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function WizardButtons({
  selected,
  setSelected,
  firstStep = false,
  customFinish,
  lastStep = false,
  onComplete,
  onCancel,
  validation,
}) {
  const { t } = useTranslation();

  const goToNextStep = () => {
    setSelected(selected + 1);
  };

  const goToPreviousStep = () => {
    setSelected(selected - 1);
  };

  return (
    <>
      {!firstStep && (
        <Button onClick={goToPreviousStep}>
          {t('clusters.buttons.previous-step')}
        </Button>
      )}
      <Button
        design="Emphasized"
        onClick={lastStep ? onComplete : goToNextStep}
        disabled={validation}
      >
        {lastStep
          ? customFinish
            ? customFinish
            : t('common.buttons.submit')
          : t('clusters.buttons.next-step')}
      </Button>
      <Button design="Transparent" onClick={onCancel}>
        {t('common.buttons.cancel')}
      </Button>
    </>
  );
}
