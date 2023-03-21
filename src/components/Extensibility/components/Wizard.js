import React, { useState } from 'react';
import { Button, Dialog } from 'fundamental-react';

import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

import { ExtensibilityWizard } from '../ExtensibilityWizard';

export function Wizard({
  value,
  // structure,
  schema,
  originalResource,
  scope,
  arrayItems,
}) {
  const [showWizard, setShowWizard] = useState(false);
  // structure?.steps
  return (
    <>
      <Button onClick={() => setShowWizard(!showWizard)}>{value}</Button>
      <Dialog
        show={showWizard}
        className="wizard-dialog"
        title={'«extensibility wizard»'}
        actions={[]}
      >
        <ErrorBoundary>
          <ExtensibilityWizard onCancel={() => setShowWizard(false)} />
        </ErrorBoundary>
      </Dialog>
    </>
  );
}
