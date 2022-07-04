import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { ActionBar, Breadcrumb, LayoutPanel } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';

EntryNotFound.propTypes = {
  entryType: PropTypes.string.isRequired,
  entryId: PropTypes.string,
  navigate: PropTypes.func,
};

export default function EntryNotFound({ entryType, entryId, navigate }) {
  const navigateToList = () => {
    navigate
      ? navigate()
      : LuigiClient.linkManager()
          .fromClosestContext()
          .navigate('');
  };

  const { t } = useTranslation();

  return (
    <>
      <header className="fd-has-background-color-background-2">
        <section className="fd-has-padding-regular fd-has-padding-bottom-none">
          <section>
            <Breadcrumb>
              <Breadcrumb.Item
                name={`${entryType}s`}
                url="#"
                onClick={() => navigateToList()}
              />
              <Breadcrumb.Item />
            </Breadcrumb>
            <ActionBar title={entryId || t('common.messages.doesnt-exist')} />
          </section>
        </section>
      </header>
      <LayoutPanel className="fd-has-padding-regular fd-margin--md">
        {entryType} "{entryId}" {t('common.messages.loading-name')}
      </LayoutPanel>
    </>
  );
}
