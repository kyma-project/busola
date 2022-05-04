import React, { useRef, useEffect } from 'react';
import { MonacoEditor } from 'shared/components/MonacoEditor/MonacoEditor';
import { Editor as MEESM } from 'shared/components/MonacoEditorESM/Editor';
import { useTheme } from 'shared/contexts/ThemeContext';

export default function Editor({
  id,
  language = '',
  originalValue = '',
  value = '',
  controlledValue = '',
  setControlledValue = '',
  setValue,
  debouncedCallback = () => void 0,
}) {
  const subscription = useRef();
  const editorContainer = useRef();
  const monacoEditorInstance = useRef();
  const { editorTheme } = useTheme();

  const observer =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          _ => {
            if (monacoEditorInstance.current)
              monacoEditorInstance.current.layout(); // force Monaco redraw once an intersection occured
          },
          { root: document.documentElement },
        )
      : undefined;

  // unsubscribe
  useEffect(() => {
    return () => {
      if (
        subscription &&
        subscription.current &&
        typeof subscription.current.dispose === 'function'
      ) {
        subscription.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (observer) {
      observer.observe(editorContainer.current);
      // add intersection observer to both versions of the editor
    } else {
      console.warn(
        'Could not apply IntersectionObserver to code editor. Visibility problems may occur.',
      );
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleControlledChange = React.useCallback(
    value => {
      // setValue(value);
      // setControlledValue(value);
      // debouncedCallback();
    },
    [debouncedCallback, setValue, setControlledValue],
  );

  return (
    <div className="controlled-editor" ref={editorContainer}>
      {/*<MonacoEditor*/}
      {/*  onMount={editor => (monacoEditorInstance.current = editor)}*/}
      {/*  id={id}*/}
      {/*  height="30em"*/}
      {/*  language={language}*/}
      {/*  theme={editorTheme}*/}
      {/*  value={controlledValue}*/}
      {/*  options={{*/}
      {/*    scrollbar: {*/}
      {/*      alwaysConsumeMouseWheel: false,*/}
      {/*    },*/}
      {/*  }}*/}
      {/*  onChange={handleControlledChange}*/}
      {/*/>*/}
      <MEESM
        autocompletionDisabled
        onMount={editor => (monacoEditorInstance.current = editor)}
        height="30em"
        language={language}
        theme={editorTheme}
        value={controlledValue}
        options={{
          scrollbar: {
            alwaysConsumeMouseWheel: false,
          },
        }}
        customSchemaId={id}
        onChange={handleControlledChange}
      />
    </div>
  );
}
