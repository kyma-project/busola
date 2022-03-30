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
}) {
  const [fileName, setFileName] = useState('');
  const [draggingOverCounter, setDraggingCounter] = useState(0);
  const { t } = useTranslation(null, { i18n });

  // needed for onDrag to fire
  function dragOver(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function fileChanged(file) {
    setFileName(file ? file.name : '');
    if (file) {
      fileInputChanged(file);
    }
  }

  function drop(e) {
    setDraggingCounter(0);
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation(); // to avoid event.js error
    fileChanged(e.dataTransfer.files[0]);
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
      {!!fileName && <p className="file-input__secondary">{fileName}</p>}
      <input
        ref={inputRef}
        type="file"
        id="file-upload"
        onChange={e => fileChanged(e.target.files[0])}
        aria-hidden="true"
        accept={acceptedFileFormats}
        required={required}
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
