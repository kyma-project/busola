import React, { useEffect, useState } from 'react';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { FormField } from '../../components/FormField';
import * as Inputs from 'shared/ResourceForm/inputs';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { Button } from 'fundamental-react';

export function RichEditorSection({ dataKey: key, value, onChange, onDelete }) {
  const [internalKey, setInternalKey] = useState();
  const [internalValue, setInternalValue] = useState();

  const deleteAction = onDelete && (
    <Button glyph="delete" compact type="negative" onClick={onDelete}></Button>
  );

  useEffect(() => {
    setInternalKey(key);
  }, [key]);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <CollapsibleSection
      title={key}
      defaultOpen
      canChangeState={false}
      actions={deleteAction}
    >
      <FormField
        value={internalKey}
        setValue={key => setInternalKey(key)}
        input={Inputs.Text}
        label="Key"
        className="fd-margin-bottom--sm"
        onBlur={() => onChange({ key: internalKey, value: internalValue })}
      />
      <Editor
        value={internalValue}
        onChange={value => setInternalValue(value)}
        autocompletionDisabled={true}
        height="200px"
        onBlur={() => onChange({ key: internalKey, value: internalValue })}
      />
    </CollapsibleSection>
  );
}
