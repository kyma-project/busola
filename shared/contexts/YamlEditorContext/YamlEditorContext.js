import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import { SideDrawer } from '../../components/SideDrawer/SideDrawer';
import { Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { YamlContent } from './YamlContent';
import { isValidYaml } from './isValidYaml';
import './YamlEditorContext.scss';

export const YamlEditorContext = createContext({
  setEditedYaml: _ => {},
});

const DrawerHeader = ({ title, closeEditor }) => (
  <header className="yaml-editor-header">
    <h1 className="fd-has-type-4">{title || 'YAML'}</h1>
    <Button
      option="transparent"
      glyph="decline"
      aria-label="close drawer"
      onClick={closeEditor}
    />
  </header>
);

export const YamlEditorProvider = ({ children }) => {
  const [yaml, setYaml] = useState(null);
  const [title, setTitle] = useState('');
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

  function setEditedYaml(newYaml, title, onSaveHandler) {
    onSaveFn.current = onSaveHandler;
    setTitle(title);
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

  const drawerComponent = (
    <SideDrawer
      isOpen={isOpen}
      setOpen={setOpen}
      buttonText={null}
      hideDefaultButton={true}
    >
      <DrawerHeader title={title} closeEditor={closeEditor} />
      {isOpen && (
        <YamlContent
          yaml={yaml}
          setChangedYamlFn={setChangedYaml}
          title={title}
          onSave={handleSaveClick}
          saveDisabled={!isValidYaml(changedYaml)}
        />
      )}
    </SideDrawer>
  );

  return (
    <YamlEditorContext.Provider
      value={{
        setEditedYaml,
        closeEditor,
        currentlyEditedResourceUID: (isOpen && yaml?.metadata?.uid) || null, // provide the UID of the currently edited resource if possible
      }}
    >
      {drawerComponent}
      {children}
    </YamlEditorContext.Provider>
  );
};

export function useYamlEditor() {
  return useContext(YamlEditorContext);
}
