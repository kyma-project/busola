import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Dialog, Button } from 'fundamental-react';
import { ModeSelector } from './ModeSelector/ModeSelector';
import { Editor } from './Editor/Editor';
import './CreateModal.scss';
import { CollapsibleSection } from './CollapsibleSection/CollapsibleSection';
import { Presets } from './Presets';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [isOpen, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState(ModeSelector.MODE_SIMPLE);
  const formRef = React.useRef();
  const [formValid, setFormValid] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      LuigiClient.uxManager().addBackdrop();
    } else {
      LuigiClient.uxManager().removeBackdrop();
    }
  }, [isOpen]);

  function revalidate() {
    // wait for React to flush the updates
    setTimeout(() => {
      setFormValid(formRef?.current?.checkValidity());
    });
  }

  React.useEffect(revalidate, [formRef, resource]);

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
        onSubmit={onCreate}
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
    <Button disabled={!formValid} onClick={onCreate}>
      {t('common.buttons.create')}
    </Button>,
    <Button option="transparent">{t('common.buttons.cancel')}</Button>,
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
          setOpen(false);
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

CreateModal.FormField = function({ label, input }) {
  return (
    <div className="fd-row form-field">
      <div className="fd-col fd-col-md--4 form-field__label">{label}</div>
      <div className="fd-col fd-col-md--7">{input}</div>
    </div>
  );
};

CreateModal.Section = ({ children }) => (
  <div className="fd-margin--sm">{children}</div>
);
