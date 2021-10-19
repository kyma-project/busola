import React from 'react';
import { ControlledBy, ModalWithForm } from 'react-shared';
import { Button } from 'fundamental-react';
import { EditConfigMapForm } from './EditConfigMapForm';
import { ReadonlyEditorPanel } from '../../../../shared/components/ReadonlyEditorPanel';
import { useTranslation } from 'react-i18next';

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
          <EditConfigMapForm
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
