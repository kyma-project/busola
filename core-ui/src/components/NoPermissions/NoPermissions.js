import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Icon } from 'fundamental-react';
import './NoPermissions.scss';

// as Luigi docs say, "some special characters (<, >, ", ', /) in node parameters are HTML-encoded."
function decodeHTMLEncoded(str) {
  return str.replaceAll('&quot;', '"');
}

export function NoPermissions() {
  let { error } = LuigiClient.getNodeParams();
  if (error) {
    error = decodeHTMLEncoded(error);
  } else {
    error = "You don't have enough permissions to view this content.";
  }

  return (
    <section className="no-permissions">
      <Icon ariaLabel="no-permissions" glyph="locked" />
      <header>Not enough permissions</header>
      <p className="fd-margin--md">{error}</p>
      <p>Contact your administrator to grant you access.</p>
    </section>
  );
}
