import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function WizardButtons({
  selectedStep,
  setSelectedStep,
  firstStep = false,
  customFinish,
  lastStep = false,
  onComplete,
  onCancel,
  invalid,
  className,
}) {
  const { t } = useTranslation();

  const goToNextStep = () => {
    setSelectedStep(selectedStep + 1);
  };

  const goToPreviousStep = () => {
    setSelectedStep(selectedStep - 1);
  };

  return (
    <div className={`${className} sap-margin-top-small`}>
      {!firstStep && (
        <Button
          design="Transparent"
          onClick={goToPreviousStep}
          accessibleName="previous-step"
        >
          {t('clusters.buttons.previous-step')}
        </Button>
      )}
      <Button
        design="Emphasized"
        onClick={lastStep ? onComplete : goToNextStep}
        disabled={invalid}
        accessibleName={lastStep ? 'last-step' : 'next-step'}
      >
        {lastStep
          ? customFinish
            ? customFinish
            : t('common.buttons.submit')
          : t('clusters.buttons.next-step')}
      </Button>
      <Button design="Transparent" onClick={onCancel} accessibleName="cancel">
        {t('common.buttons.cancel')}
      </Button>
    </div>
  );
}
