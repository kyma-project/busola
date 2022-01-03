import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { useMicrofrontendContext } from 'react-shared';

export function Result(props) {
  const {
    activeClusterName,
    namespaceId: namespace,
  } = useMicrofrontendContext();

  const { type, title, isNamespaced, resourceType, url } = props;
  switch (type) {
    case 'open-preferences':
      return (
        <Link
          className="fd-link"
          onClick={() => {
            LuigiClient.linkManager().openAsModal('preferences', {
              title: 'Preferences',
              size: 'm',
            });
          }}
        >
          Open Preferences
        </Link>
      );
    case 'navigation':
      return (
        <Link
          className="fd-link"
          onClick={() => {
            LuigiClient.linkManager().navigate(url);
          }}
        >
          {title}
        </Link>
      );
  }

  // const { name, url, isNamespaced } = props;
  return <p>{JSON.stringify(props)}</p>;
  // const navigate = () => {
  //   const context = isNamespaced ? 'namespace' : 'cluster';
  //   LuigiClient.linkManager()
  //     .fromContext(context)
  //     .navigate(url);
  // };

  // return (
  //   <Link className="fd-link" onClick={navigate}>
  //     {name}
  //   </Link>
  // );
}

export function SuggestedSearch({ search, suggestedSearch, setSearch }) {
  if (!suggestedSearch || suggestedSearch === search) {
    return null;
  }
  //enter to choose
  return (
    <>
      Did you mean:
      <button onClick={() => setSearch(suggestedSearch)}>
        {suggestedSearch}
      </button>
    </>
  );
}
