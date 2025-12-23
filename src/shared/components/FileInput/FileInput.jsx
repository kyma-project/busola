import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import PropTypes from 'prop-types';
import { Icon } from '@ui5/webcomponents-react';
import classNames from 'classnames';
import { showYamlUploadDialogAtom } from 'state/showYamlUploadDialogAtom';
import { showAddClusterWizardAtom } from 'state/showAddClusterWizardAtom';

import './FileInput.scss';

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
  allowMultiple,
  customMessage,
}) {
  const [fileNames, setFileNames] = useState([]);
  const openAddCluster = useAtomValue(showAddClusterWizardAtom);
  const openAdd = useAtomValue(showYamlUploadDialogAtom);
  const [draggingOverCounter, setDraggingCounter] = useState(0);
  const { t } = useTranslation();
  const fileNameRef = useRef(null);

  useEffect(() => {
    if (!openAdd && !openAddCluster) {
      const timeoutId = setTimeout(() => {
        setFileNames([]);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [openAdd, openAddCluster]);

  // needed for onDrag to fire
  function dragOver(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function fileChanged(files) {
    setFileNames([...files]?.map((file) => file.name || ''));
    if (files.length) {
      fileInputChanged(files);
    }

    if (fileNameRef.current) {
      setTimeout(() => {
        fileNameRef.current?.focus();
      }, 50); // Timeout to ensure the focus is set after the DOM update
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

  const message = customMessage
    ? `${customMessage} ${
        fileNames.length
          ? t('components.file-input.replace')
          : t('components.file-input.upload')
      }`
    : `${t('components.file-input.drag-file-upload')} ${
        fileNames.length
          ? t('components.file-input.replace')
          : t('components.file-input.upload')
      }`;

  return (
    <label
      htmlFor="file-upload"
      className={containerClass}
      onDrop={drop}
      onDragEnter={() => setDraggingCounter(draggingOverCounter + 1)}
      onDragLeave={() => setDraggingCounter(draggingOverCounter - 1)}
      onFocus={() => setDraggingCounter(draggingOverCounter + 1)}
      onBlur={() => setDraggingCounter(draggingOverCounter - 1)}
      onDragOver={dragOver}
    >
      <input
        ref={inputRef}
        type="file"
        id="file-upload"
        onChange={(e) => fileChanged(e.target.files)}
        aria-hidden="true"
        accept={acceptedFileFormats}
        required={required}
        multiple={allowMultiple}
      />
      <div>
        <Icon
          name="upload"
          accessibleName="file upload"
          design="Information"
          className="file-input__icon"
        />
        <p className="sap-margin-y-small">{message}</p>
        {availableFormatsMessage && (
          <p className="file-input__secondary">{availableFormatsMessage}</p>
        )}

        <p className="file-input__secondary" ref={fileNameRef} tabIndex={1}>
          {fileNames.length
            ? `${fileNames.join(', ')} ${t('components.file-input.uploaded')}`
            : ''}
        </p>
      </div>
    </label>
  );
}
