import React, { useState } from 'react';
import { Button, Dialog } from 'fundamental-react';

import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

import { ExtensibilityWizard } from '../ExtensibilityWizard';
import { useFeature } from 'hooks/useFeature';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';

export function Wizard({
  value,
  structure,
  schema,
  originalResource,
  scope,
  arrayItems,
}) {
  const { t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const [showWizard, setShowWizard] = useState(false);
  const { isEnabled: isWizardEnabled } = useFeature('EXTENSIBILITY_WIZARD');
  const wizardName = structure?.wizard || '';

  if (!isWizardEnabled) return null;

  return (
    <>
      <Button onClick={() => setShowWizard(!showWizard)}>
        {tExt(value ?? structure.name)}
      </Button>
      <Dialog
        show={showWizard}
        className="wizard-dialog"
        title={t('extensibility.wizard.headers.name') + ' ' + wizardName}
        actions={[]}
      >
        <ErrorBoundary>
          <ExtensibilityWizard
            onCancel={() => setShowWizard(false)}
            wizardName={wizardName}
          />
        </ErrorBoundary>
      </Dialog>
    </>
  );
}
