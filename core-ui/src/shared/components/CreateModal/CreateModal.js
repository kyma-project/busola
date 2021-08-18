import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Dialog, Button } from 'fundamental-react';
import {
  ModeSelector,
  MODE_ADVANCED,
  MODE_SIMPLE,
  MODE_YAML,
} from './ModeSelector/ModeSelector';
import { Editor } from './Editor';
import './CreateModal.scss';
import { CollapsibleSection } from './CollapsibleSection/CollapsibleSection';
import { Presets } from './Presets';

export function CreateModal({
  modalOpeningComponent,
  simpleForm,
  advancedForm,
  title,
  resource,
  setResource,
  onClose,
  onCreate,
  toYaml,
  fromYaml,
  presets,
}) {
  const [isOpen, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState(MODE_SIMPLE);
  const formRef = React.useRef();
  const [formValid, setFormValid] = React.useState(false);

  function revalidate() {
    // wait for React to flush the updates
    setTimeout(() => {
      setFormValid(formRef?.current?.checkValidity());
    });
  }

  React.useEffect(() => {
    revalidate();
  }, [formRef]);

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
      <div onChange={revalidate}>{mode === MODE_SIMPLE && simpleForm}</div>
      <form
        onChange={revalidate}
        ref={formRef}
        style={{ display: mode === MODE_ADVANCED ? 'initial' : 'none' }}
        onSubmit={confirm}
      >
        {advancedForm}
      </form>
      {mode === MODE_YAML && (
        <Editor
          resource={toYaml(resource)}
          setResource={yaml => {
            setResource(fromYaml(yaml, resource));
          }}
        />
      )}
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
          setMode(MODE_SIMPLE);
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
  <div style={{ padding: '16px' }}>{children}</div>
);
