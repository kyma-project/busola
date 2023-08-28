import React, { useState } from 'react';
import { Button } from '@ui5/webcomponents-react';
import { Dialog } from 'fundamental-react';

import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

import { ExtensibilityWizard } from '../ExtensibilityWizard';
import { useFeature } from 'hooks/useFeature';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { useEventListener } from 'hooks/useEventListener';

export function Wizard({ value, structure, singleRootResource }) {
  const { t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const [showWizard, setShowWizard] = useState(false);
  const { isEnabled: isWizardEnabled } = useFeature('EXTENSIBILITY_WIZARD');
  const wizardName = structure?.wizard || '';

  const handleCloseWithEscape = e => {
    if (e.key === 'Escape') handleCloseModal();
  };

  useEventListener('keydown', handleCloseWithEscape);

  if (!isWizardEnabled) return null;

  const handleCloseModal = () => {
    setShowWizard(false);
  };

  return (
    <>
      <Button onClick={() => setShowWizard(!showWizard)}>
        {tExt(value ?? structure.name)}
      </Button>
      <Dialog
        show={showWizard}
        onBeforeClose={setShowWizard(false)}
        className="wizard-dialog"
        title={t('extensibility.wizard.headers.name') + ' ' + wizardName}
        actions={[]}
      >
        <ErrorBoundary onClose={handleCloseModal}>
          <ExtensibilityWizard
            onCancel={() => setShowWizard(false)}
            wizardName={wizardName}
            singleRootResource={singleRootResource}
          />
        </ErrorBoundary>
      </Dialog>
    </>
  );
}
