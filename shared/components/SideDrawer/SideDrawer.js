import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ControlledEditor } from '@monaco-editor/react';
import jsyaml from 'js-yaml';
import { Icon } from 'fundamental-react';

import './SideDrawer.scss';
import { CopiableText } from '../CopiableText/CopiableText';

const MIN_EDITOR_RATIO = 30; // %
const MAX_EDITOR_RATIO = 90;

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
    textToCopy = jsyaml.safeDump(children);
    children = (
      <>
        <h1 className="fd-has-type-4">YAML</h1>
        <ControlledEditor
          height="90vh"
          width="100%"
          language={'yaml'}
          theme="vs-light"
          value={textToCopy}
          options={{ readOnly: true }}
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

  const keyDown = React.useCallback(({ key }) => {
    if (key === 'Escape') setOpen(false);
  });

  useEffect(() => {
    document.addEventListener('keydown', keyDown);
    return () => document.removeEventListener('keydown', keyDown);
  }, []);

  const style = { width: `max(${width}vw, 360px)` };

  return (
    <div
      className={classNames('side-drawer', { 'side-drawer--open': isOpen })}
      style={style}
    >
      {(isOpen || children) && (
        <button
          className={`open-btn ${!buttonText ? 'open-btn-hidden' : ''}`}
          onClick={() => setOpen(!isOpen)}
        >
          <Icon
            glyph={isOpen ? 'open-command-field' : 'close-command-field'}
            size="l"
            ariaLabel="Open/close the drawer"
          />
          {buttonText}
        </button>
      )}

      <section className="content">
        <div className="handle" onMouseDown={onResizeStart} />
        <div className="content-wrapper">
          {children}
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
