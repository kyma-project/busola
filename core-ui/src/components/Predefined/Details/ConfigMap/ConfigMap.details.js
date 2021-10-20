import React from 'react';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ControlledBy, ModalWithForm } from 'react-shared';

import { ConfigMapsCreate } from '../../Create/ConfigMaps/ConfigMaps.create';
import { ReadonlyEditorPanel } from '../../../../shared/components/ReadonlyEditorPanel';

export const ConfigMapsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();
  const ConfigMapEditor = resource => {
    const { data } = resource;
    return Object.keys(data || {}).map(key => (
      <ReadonlyEditorPanel title={key} value={data[key]} key={key} />
    ));
  };

  const headerActions = [
    configMap => (
      <ModalWithForm
        key="edit-config-map-modal"
        title={t('config-maps.subtitle.edit-config-map')}
        modalOpeningComponent={
          <Button className="fd-margin-end--tiny" option="transparent">
            {t('common.buttons.edit')}
          </Button>
        }
        confirmText={t('common.buttons.edit')}
        className="modal-size--l"
        renderForm={props => (
          <ConfigMapsCreate
            configMap={configMap}
            resourceUrl={otherParams.resourceUrl}
            readonlyName={true}
            {...props}
          />
        )}
        i18n={i18n}
      />
    ),
  ];

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: secret => (
        <ControlledBy ownerReferences={secret.metadata.ownerReferences} />
      ),
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[ConfigMapEditor]}
      customColumns={customColumns}
      resourceHeaderActions={headerActions}
      {...otherParams}
    />
  );
};
