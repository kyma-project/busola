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
    <div className="bsl-margin-top--sm">
      {!firstStep && (
        <Button
          onClick={goToPreviousStep}
          className="bsl-margin-end--tiny"
          aria-label="previous-step"
        >
          {t('clusters.buttons.previous-step')}
        </Button>
      )}
      <Button
        design="Emphasized"
        onClick={lastStep ? onComplete : goToNextStep}
        disabled={validation}
        className="bsl-margin-end--tiny"
        aria-label={lastStep ? 'last-step' : 'next-step'}
      >
        {lastStep
          ? customFinish
            ? customFinish
            : t('common.buttons.submit')
          : t('clusters.buttons.next-step')}
      </Button>
      <Button design="Transparent" onClick={onCancel} aria-label="cancel">
        {t('common.buttons.cancel')}
      </Button>
    </div>
  );
}
