import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'fundamental-react';
import classNames from 'classnames';
import './FileInput.scss';
import { useTranslation } from 'react-i18next';

FileInput.propTypes = {
  fileInputChanged: PropTypes.func.isRequired,
  availableFormatsMessage: PropTypes.string,
  acceptedFileFormats: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

export function FileInput({
  fileInputChanged,
  availableFormatsMessage,
  acceptedFileFormats,
  inputRef,
  required,
  i18n,
  allowMultiple,
}) {
  const [fileNames, setFileNames] = useState([]);
  const [draggingOverCounter, setDraggingCounter] = useState(0);
  const { t } = useTranslation(null, { i18n });

  // needed for onDrag to fire
  function dragOver(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function fileChanged(files) {
    setFileNames([...files].map(file => file.name || ''));
    if (files.length) {
      fileInputChanged(files);
    }
  }

  function drop(e) {
    setDraggingCounter(0);
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation(); // to avoid event.js error
    fileChanged(e.dataTransfer.files);
  }

  const containerClass = classNames('file-input', {
    'file-input--drag-over': draggingOverCounter !== 0,
  });

  return (
    <label
      htmlFor="file-upload"
      className={containerClass}
      onDrop={drop}
      onDragEnter={() => setDraggingCounter(draggingOverCounter + 1)}
      onDragLeave={() => setDraggingCounter(draggingOverCounter - 1)}
      onDragOver={dragOver}
    >
      {!!fileNames.length && (
        <p className="file-input__secondary">{fileNames.join(', ')}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        id="file-upload"
        onChange={e => fileChanged(e.target.files)}
        aria-hidden="true"
        accept={acceptedFileFormats}
        required={required}
        multiple={allowMultiple}
      />
      <div>
        <Icon glyph="upload" ariaLabel="file upload" />
        <p>{t('components.file-input.drag-file')}</p>
        {availableFormatsMessage && (
          <p className="file-input__secondary">{availableFormatsMessage}</p>
        )}
      </div>
    </label>
  );
}
