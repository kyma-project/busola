import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@ui5/webcomponents-react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { showYamlUploadDialogState } from 'state/showYamlUploadDialogAtom';

import './FileInput.scss';
import { showAddClusterWizard } from 'state/showAddClusterWizard';

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
}) {
  const [fileNames, setFileNames] = useState([]);
  const openAdd = useRecoilValue(showYamlUploadDialogState);
  const openAddCluster = useRecoilValue(showAddClusterWizard);
  const [draggingOverCounter, setDraggingCounter] = useState(0);
  const { t } = useTranslation();

  console.log(openAdd, openAddCluster);

  useEffect(() => {
    if (!openAdd && !openAddCluster) setFileNames([]);
  }, [openAdd, openAddCluster]);

  // needed for onDrag to fire
  function dragOver(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function fileChanged(files) {
    setFileNames([...files]?.map(file => file.name || ''));
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
        <Icon name="upload" aria-label="file upload" design="Information" />
        <p>{t('components.file-input.drag-file')}</p>
        {availableFormatsMessage && (
          <p className="file-input__secondary">{availableFormatsMessage}</p>
        )}
      </div>
    </label>
  );
}
