import React, { useState, useEffect } from 'react';
import { Button, FormLabel } from 'fundamental-react';
import { K8sNameInput, LabelSelectorInput, usePost } from 'react-shared';

import './AddonsConfigurations.scss';

export const AddonsConfigurations = ({
  formElementRef,
  onChange,
  onCompleted,
  onError,
  resourceType,
  resourceUrl,
  namespace,
  refetchList,
  setCustomValid,
}) => {
  const [name, setName] = useState('');
  const [labels, setLabels] = useState({});
  const [newUrl, setNewUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const request = usePost();

  useEffect(_ => setCustomValid(!!urls.length), [urls, setCustomValid]);

  const handleLabelsChanged = newLabels => {
    setLabels(newLabels);
  };

  const handleNameChanged = event => {
    setName(event.target.value);
  };

  const handleUrlChanged = event => {
    const url = event.target.value;
    setNewUrl(url);
  };

  const handleUrlAdded = () => {
    setUrls([...urls, newUrl]);
    setNewUrl('');
  };

  const handleUrlRemoved = url => {
    setUrls(urls => urls.filter(u => u !== url));
  };

  const handleFormSubmit = async e => {
    e.preventDefault();

    const repositories = urls.map(url => ({ url }));
    const kind = resourceType.slice(0, -1); // "remove 's' from the end
    const resourceData = {
      kind,
      apiVersion: 'addons.kyma-project.io/v1alpha1',
      metadata: {
        name,
        namespace,
        labels,
      },
      spec: {
        repositories,
      },
    };

    try {
      await request(resourceUrl, resourceData);
      onCompleted(`Addons Configuration ${name} created`);
      refetchList();
    } catch (e) {
      onError('Cannot create Addons Configuration', `Error: ${e.message}`);
    }
  };

  const UrlsAdded = () => {
    if (urls.length > 0) {
      return urls.map(url => (
        <section className="addons-urls-list" key={url}>
          <p>{url}</p>
          <Button
            typeAttr="button"
            glyph="delete"
            type="negative"
            onClick={() => handleUrlRemoved(url)}
          />
        </section>
      ));
    }
    return <></>;
  };

  return (
    // although HTML spec assigns the role by default to a <form> element, @testing-library ignores it
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <form
      role="form"
      onChange={onChange}
      ref={formElementRef}
      onSubmit={handleFormSubmit}
    >
      <div className="fd-form__set">
        <div className="fd-form__item">
          <K8sNameInput
            onChange={handleNameChanged}
            id={`${resourceType}-name`}
            kind={resourceType}
          />
        </div>

        <LabelSelectorInput labels={labels} onChange={handleLabelsChanged} />
        <FormLabel htmlFor={`${resourceType}-urls`}>URLs</FormLabel>
        <section className="addons-urls-editor">
          <input
            className="fd-form__control"
            type="text"
            id={`${resourceType}-url-input`}
            placeholder="Enter URL"
            value={newUrl}
            onChange={handleUrlChanged}
          />
          <Button
            glyph="add"
            type="positive"
            typeAttr="button"
            disabled={!newUrl}
            onClick={handleUrlAdded}
            key={`${resourceType}-url-add`}
          />
        </section>
        <UrlsAdded />
      </div>
    </form>
  );
};
