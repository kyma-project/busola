import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Dialog, Button } from 'fundamental-react';
import { ModeSelector } from './ModeSelector/ModeSelector';
import { Editor } from './Editor';
import './CreateModal.scss';
import { CollapsibleSection } from './CollapsibleSection/CollapsibleSection';
import { Presets } from './Presets';

export function CreateModal({
  title,
  modalOpeningComponent,
  simpleForm,
  advancedForm,
  resource,
  setResource,
  onClose,
  onCreate,
  toYaml,
  fromYaml,
  presets,
}) {
  const [isOpen, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState(ModeSelector.MODE_SIMPLE);
  const formRef = React.useRef();
  const [formValid, setFormValid] = React.useState(false);

  function revalidate() {
    // wait for React to flush the updates
    setTimeout(() => {
      setFormValid(formRef?.current?.checkValidity());
    });
  }

  React.useEffect(revalidate, [formRef]);

  function setOpenStatus(status) {
    if (status) {
      LuigiClient.uxManager().addBackdrop();
    } else {
      LuigiClient.uxManager().removeBackdrop();
    }
    setOpen(status);
  }

  async function confirm(e) {
    e && e.preventDefault();
    if ((await onCreate()) !== false) {
      setOpenStatus(false);
    }
  }

  const formsToDisplay = (
    <>
      {mode === ModeSelector.MODE_SIMPLE && (
        <div onChange={revalidate}>{simpleForm}</div>
      )}
      {mode === ModeSelector.MODE_YAML && (
        <Editor
          resource={toYaml(resource)}
          setResource={yaml => {
            setResource(fromYaml(yaml, resource));
          }}
        />
      )}

      {/* always keep the advanced form to ensure validation */}
      <form
        onChange={revalidate}
        ref={formRef}
        style={{
          display: mode === ModeSelector.MODE_ADVANCED ? 'initial' : 'none',
        }}
        onSubmit={confirm}
      >
        {advancedForm}
      </form>
    </>
  );

  const content = (
    <>
      {presets?.length && (
        <Presets
          presets={presets}
          onSelect={preset => {
            setResource(preset.value);
            revalidate();
          }}
        />
      )}
      <ModeSelector
        mode={mode}
        setMode={setMode}
        style={{ position: 'sticky' }}
      />
      {formsToDisplay}
    </>
  );

  const actions = [
    <Button disabled={!formValid} onClick={confirm}>
      Create
    </Button>,
    <Button onClick={() => setOpenStatus(false)} option="transparent">
      Cancel
    </Button>,
  ];

  return (
    <>
      <div style={{ display: 'contents' }} onClick={() => setOpen(true)}>
        {modalOpeningComponent}
      </div>
      <Dialog
        className="create-modal"
        show={isOpen}
        actions={actions}
        onClose={() => {
          setOpenStatus(false);
          setMode(ModeSelector.MODE_SIMPLE);
          onClose && onClose();
        }}
        title={title}
      >
        {content}
      </Dialog>
    </>
  );
}

CreateModal.CollapsibleSection = CollapsibleSection;

CreateModal.Section = ({ children }) => (
  <div className="fd-margin--sm">{children}</div>
);
