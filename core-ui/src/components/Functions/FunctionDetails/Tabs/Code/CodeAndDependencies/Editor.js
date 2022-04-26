import React, { useRef, useEffect } from 'react';
import { DiffEditor } from 'shared/components/MonacoEditor/MonacoEditor';
import { MonacoEditor } from 'shared/components/MonacoEditor/MonacoEditor';
import { useTheme } from 'shared/contexts/ThemeContext';

export default function Editor({
  id,
  language = 'javascript',
  showDiff = false,
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
  }, [showDiff]);

  function handleDiffEditorDidMount(editor) {
    monacoEditorInstance.current = editor;
    const { modified } = editor.getModel();

    subscription.current = modified.onDidChangeContent(_ => {
      setValue(modified.getValue());
      debouncedCallback();
    });
  }

  function handleControlledChange(value) {
    setValue(value);
    setControlledValue(value);
    debouncedCallback();
  }

  if (showDiff) {
    return (
      <div className="diff-editor" ref={editorContainer}>
        <DiffEditor
          id={id}
          height="30em"
          language={language}
          theme={editorTheme}
          original={originalValue}
          modified={controlledValue}
          onMount={handleDiffEditorDidMount}
        />
      </div>
    );
  }

  return (
    <div className="controlled-editor" ref={editorContainer}>
      <MonacoEditor
        onMount={editor => (monacoEditorInstance.current = editor)}
        id={id}
        height="30em"
        language={language}
        theme={editorTheme}
        value={controlledValue}
        options={{
          scrollbar: {
            alwaysConsumeMouseWheel: false,
          },
        }}
        onChange={handleControlledChange}
      />
    </div>
  );
}
