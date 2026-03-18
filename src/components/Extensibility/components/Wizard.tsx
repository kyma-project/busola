import { useState } from 'react';
import { Button, Dialog } from '@ui5/webcomponents-react';

import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

import { ExtensibilityWizard } from '../ExtensibilityWizard';
import { useFeature } from 'hooks/useFeature';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { useEventListener } from 'hooks/useEventListener';
import { createPortal } from 'react-dom';
import { configFeaturesNames } from 'state/types';

interface WizardProps {
  value: any;
  structure: any;
  singleRootResource: any;
}

export function Wizard({ value, structure, singleRootResource }: WizardProps) {
  const { t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const [showWizard, setShowWizard] = useState(false);
  const { isEnabled: isWizardEnabled } = useFeature(
    configFeaturesNames.EXTENSIBILITY_WIZARD,
  );
  const wizardName = structure?.wizard || '';

  const handleCloseModal = () => {
    setShowWizard(false);
  };

  const handleCloseWithEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleCloseModal();
  };

  useEventListener('keydown', handleCloseWithEscape);

  if (!isWizardEnabled) return null;

  return (
    <>
      <Button design="Emphasized" onClick={() => setShowWizard(!showWizard)}>
        {tExt(value ?? structure.name)}
      </Button>
      {createPortal(
        <Dialog
          open={showWizard}
          className="wizard-dialog"
          headerText={t('extensibility.wizard.headers.name') + ' ' + wizardName}
          onClose={() => setShowWizard(false)}
        >
          <ErrorBoundary onClose={handleCloseModal}>
            <ExtensibilityWizard
              onCancel={() => setShowWizard(false)}
              wizardName={wizardName}
              singleRootResource={singleRootResource}
            />
          </ErrorBoundary>
        </Dialog>,
        document.body,
      )}
    </>
  );
}
