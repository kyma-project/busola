import React from 'react';
import { ControlledEditor, useTheme } from 'react-shared';
import jsyaml from 'js-yaml';
import { MessageStrip } from 'fundamental-react';

export function Editor({ resource, setResource }) {
  const [error, setError] = React.useState(false);
  const { editorTheme } = useTheme();
  // don't useState, as it's value needs to be referenced in onEditorBlur
  // using useState value in onEditorBlur results in stale closure
  const textResource = React.useRef(jsyaml.dump(resource, { noRefs: true }));

  React.useEffect(() => {
    textResource.current = jsyaml.dump(resource, { noRefs: true });
  }, [resource]);

  const handleChange = (_, text) => {
    textResource.current = text;
    try {
      jsyaml.load(text);
      setError(null);
    } catch ({ message }) {
      // get the message until the newline
      setError(message.substr(0, message.indexOf('\n')));
    }
  };

  const onEditorBlur = () => {
    let parsed;
    try {
      parsed = jsyaml.load(textResource.current);
    } catch (_) {}
    if (parsed) {
      setResource(parsed);
    }
  };

  return (
    <>
      <div style={{ height: 'calc(100% - 110px)' }}>
        <ControlledEditor
          height="100%"
          language="yaml"
          theme={editorTheme}
          value={textResource.current}
          onChange={handleChange}
          editorDidMount={(_, editor) =>
            editor.onDidBlurEditorWidget(onEditorBlur)
          }
        />
      </div>
      {error && (
        <MessageStrip type="error" className="fd-margin--sm">
          Parse error: {error}, changes won't be saved.
        </MessageStrip>
      )}
    </>
  );
}
