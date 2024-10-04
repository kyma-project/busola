import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import jsyaml from 'js-yaml';
import { Button, Icon } from '@ui5/webcomponents-react';
import { CopiableText } from 'shared/components/CopiableText/CopiableText';

import './SideDrawer.scss';

const MIN_EDITOR_RATIO = 33; // %
const MAX_EDITOR_RATIO = 100;

export const SideDrawer = ({
  buttonText,
  isOpen,
  setOpen,
  children,
  bottomContent,
  withYamlEditor,
}) => {
  const [width, setWidth] = React.useState(MIN_EDITOR_RATIO);

  let textToCopy;

  if (withYamlEditor) {
    textToCopy = jsyaml.dump(children);
    children = (
      <>
        <h1 className="bsl-has-type-4">YAML</h1>
        <Editor
          height="90vh"
          autocompletionDisabled
          value={textToCopy}
          readOnly
        />
      </>
    );
  }

  const doResize = React.useCallback(({ movementX }) => {
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const scale = document.body.clientWidth / 100;

    setWidth(width =>
      clamp(
        // width in pixels - movement X, then scaled back to match vw units
        (width * scale - movementX) / scale,
        MIN_EDITOR_RATIO,
        MAX_EDITOR_RATIO,
      ),
    );
  }, []);

  const onResizeStart = e => {
    e.preventDefault();
    const stopResizing = () =>
      document.removeEventListener('mousemove', doResize);

    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResizing, { once: true });
    document.addEventListener('mouseleave', stopResizing, { once: true });
  };

  const keyDown = ({ key }) => {
    if (key === 'Escape') setOpen(false);
  };

  useEffect(() => {
    document.addEventListener('keydown', keyDown);
    return () => document.removeEventListener('keydown', keyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = { width: `max(${width}vw, 360px)` };

  return (
    <div
      className={classNames('side-drawer', { 'side-drawer--open': isOpen })}
      style={style}
    >
      {(isOpen || children) && (
        <Button
          className={`open-btn ${!buttonText ? 'open-btn-hidden' : ''}`}
          onClick={() => setOpen(!isOpen)}
        >
          <Icon
            name={isOpen ? 'open-command-field' : 'close-command-field'}
            className="bsl-icon-l"
            accessibleName="Open/close the drawer"
          />
          {buttonText}
        </Button>
      )}

      <section className="content">
        <div className="handle" onMouseDown={onResizeStart}>
          <Icon
            name="vertical-grip"
            accessibleName="resize"
            className="bsl-icon-m"
          />
        </div>
        <div className="content-wrapper">
          {children}
          {(bottomContent || textToCopy) && (
            <div className="bottom">
              {bottomContent}
              {textToCopy && (
                <CopiableText
                  textToCopy={textToCopy}
                  iconOnly={true}
                  buttonText="Copy"
                />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

SideDrawer.propTypes = {
  children: PropTypes.any.isRequired,
  bottomContent: PropTypes.element,
  withYamlEditor: PropTypes.bool,
  buttonText: PropTypes.string,
  isOpen: PropTypes.bool,
  setOpen: PropTypes.func,
};
