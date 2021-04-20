import React from 'react';
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
            <ActionBar title={entryId || 'Loading name...'} />
          </section>
        </section>
      </header>
      <LayoutPanel className="fd-has-padding-regular fd-has-margin-regular">
        {entryType} "{entryId}" doesn't exist.
      </LayoutPanel>
    </>
  );
}
