import React from 'react';
import { ModalWithForm } from 'react-shared';
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
        className="fd-dialog--xl-size modal-size--l"
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

  return (
    <DefaultRenderer
      customComponents={[ConfigMapEditor]}
      resourceHeaderActions={headerActions}
      {...otherParams}
    />
  );
};
