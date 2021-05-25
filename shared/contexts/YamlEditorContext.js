import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import { SideDrawer } from '../components/SideDrawer/SideDrawer';
import { Tooltip } from '../components/Tooltip/Tooltip';
import { Button } from 'fundamental-react';
import jsyaml from 'js-yaml';
import { ControlledEditor } from '@monaco-editor/react';
import LuigiClient from '@luigi-project/client';
import copyToCliboard from 'copy-to-clipboard';
import { saveAs } from 'file-saver';

export const YamlEditorContext = createContext({
  setEditedYaml: _ => {},
});

const isValidYaml = yaml => {
  if (!yaml) return false;
  try {
    jsyaml.safeLoad(yaml);
    return true;
  } catch (e) {
    return false;
  }
};

const YamlContent = ({ yaml, setChangedYamlFn }) => {
  const [val, setVal] = useState(jsyaml.safeDump(yaml));

  useEffect(() => {
    const converted = jsyaml.safeDump(yaml);
    setChangedYamlFn(null);
    setVal(converted);
  }, [yaml]);

  return (
    <>
      <h1 className="fd-has-type-4">
        YAML
        <Tooltip content="Copy to clipboard" position="top">
          <Button
            option="transparent"
            glyph="copy"
            onClick={() => copyToCliboard(val)}
          />
        </Tooltip>
        <Tooltip content="Download" position="top">
          <Button
            option="transparent"
            glyph="download"
            onClick={() => {
              const blob = new Blob([val], {
                type: 'application/yaml;charset=utf-8',
              });
              saveAs(blob, 'spec.yaml');
            }}
          />
        </Tooltip>
      </h1>
      <ControlledEditor
        height="90vh"
        width="min(48vw, 150em)"
        language={'yaml'}
        theme="vs-light"
        value={val}
        onChange={(_, text) => setChangedYamlFn(text)}
      />
    </>
  );
};

export const YamlEditorProvider = ({ children }) => {
  const [yaml, setYaml] = useState(null);
  const [isOpen, setOpen] = useState(false);
  const [changedYaml, setChangedYaml] = useState(null);
  const onSaveFn = useRef(_ => {});

  useEffect(() => {
    LuigiClient.uxManager().setDirtyStatus(false);
    yaml && setOpen(true);
  }, [yaml]);

  useEffect(() => {
    if (!isOpen) setYaml(null);
  }, [isOpen]);

  useEffect(() => {
    LuigiClient.uxManager().setDirtyStatus(!!changedYaml);
  }, [changedYaml]);

  function setEditedYaml(newYaml, onSaveHandler) {
    onSaveFn.current = onSaveHandler;
    setYaml(newYaml);
  }

  function closeEditor() {
    setOpen(false);
  }

  async function handleSaveClick() {
    try {
      await onSaveFn.current(changedYaml);
      closeEditor();
    } catch (_) {}
  }

  const bottomContent = (
    <>
      <Button
        className="fd-margin-end--sm"
        glyph="accept"
        type="positive"
        option="emphasized"
        onClick={handleSaveClick}
        disabled={!isValidYaml(changedYaml)}
      >
        Save
      </Button>
      <Button glyph="cancel" type="negative" onClick={() => setOpen(!isOpen)}>
        Cancel
      </Button>
    </>
  );

  const drawerComponent = (
    <SideDrawer
      isOpen={isOpen}
      setOpen={setOpen}
      buttonText={null}
      bottomContent={bottomContent}
      hideDefaultButton={true}
    >
      <YamlContent yaml={yaml} setChangedYamlFn={setChangedYaml} />
    </SideDrawer>
  );

  return (
    <YamlEditorContext.Provider value={{ setEditedYaml, closeEditor }}>
      {drawerComponent}
      {children}
    </YamlEditorContext.Provider>
  );
};

export function useYamlEditor() {
  return useContext(YamlEditorContext);
}
