import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Icon } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import './NoPermissions.scss';

// as Luigi docs say, "some special characters (<, >, ", ', /) in node parameters are HTML-encoded."
function decodeHTMLEncoded(str) {
  return str.replaceAll('&quot;', '"');
}

export function NoPermissions() {
  const { t } = useTranslation();
  let { error } = LuigiClient.getNodeParams();
  if (error) {
    error = decodeHTMLEncoded(error);
  } else {
    error = t('common.errors.no-permissions');
  }

  return (
    <section className="no-permissions">
      <Icon ariaLabel="no-permissions" glyph="locked" />
      <header>{t('common.errors.no-permissions-header')}</header>
      <p className="fd-margin--md">{error}</p>
      <p>{t('common.errors.no-permissions-message')}</p>
    </section>
  );
}
