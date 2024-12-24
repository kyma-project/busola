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
  className,
}) {
  const { t } = useTranslation();

  const goToNextStep = () => {
    setSelected(selected + 1);
  };

  const goToPreviousStep = () => {
    setSelected(selected - 1);
  };

  return (
    <div className={`${className} sap-margin-top-small`}>
      {!firstStep && (
        <Button
          design="Transparent"
          onClick={goToPreviousStep}
          className="sap-margin-end-tiny"
          accessibleName="previous-step"
        >
          {t('clusters.buttons.previous-step')}
        </Button>
      )}
      <Button
        design="Emphasized"
        onClick={lastStep ? onComplete : goToNextStep}
        disabled={validation}
        className="sap-margin-end-tiny"
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
