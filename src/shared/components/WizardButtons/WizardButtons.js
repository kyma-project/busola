import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { spacing } from '@ui5/webcomponents-react-base';

export function WizardButtons({
  selected,
  setSelected,
  firstStep = false,
  customFinish,
  lastStep = false,
  onComplete,
  onCancel,
  validation,
  className = null,
}) {
  const { t } = useTranslation();

  const goToNextStep = () => {
    setSelected(selected + 1);
  };

  const goToPreviousStep = () => {
    setSelected(selected - 1);
  };

  return (
    <div style={spacing.sapUiSmallMarginTop} className={className}>
      {!firstStep && (
        <Button
          design="Transparent"
          onClick={goToPreviousStep}
          style={spacing.sapUiTinyMarginEnd}
          aria-label="previous-step"
        >
          {t('clusters.buttons.previous-step')}
        </Button>
      )}
      <Button
        design="Emphasized"
        onClick={lastStep ? onComplete : goToNextStep}
        disabled={validation}
        style={spacing.sapUiTinyMarginEnd}
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
