import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import './WizardButtons.scss';

interface WizardButtonProps {
  selectedStep: number;
  setSelectedStep: (step: number) => void;
  firstStep?: boolean;
  customFinish?: string;
  lastStep?: boolean;
  onComplete?: () => void;
  onCancel: () => void;
  invalid?: boolean;
  className?: string;
}

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
}: WizardButtonProps) {
  const { t } = useTranslation();

  const goToNextStep = () => {
    setSelectedStep(selectedStep + 1);
  };

  const goToPreviousStep = () => {
    setSelectedStep(selectedStep - 1);
  };

  return (
    <div className={`${className} sap-margin-top-small wizard-buttons`}>
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
