import React from 'react';
import { Button, MessageStrip } from 'fundamental-react';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { prettifyKind } from 'shared/utils/helpers';
import { Link } from 'shared/components/Link/Link';
import { Trans, useTranslation } from 'react-i18next';
import { ExtensibilityStarterForm } from './ExtensibilityStarterForm';
import pluralize from 'pluralize';

export function ExtensibilityStarterModal({ crd }) {
  const { t } = useTranslation();

  const DocsLink = () => {
    return (
      <MessageStrip type="information" className="fd-margin-bottom--sm">
        <Trans i18nKey="extensibility.starter-modal.messages.docs-info">
          <Link
            className="fd-link"
            url="https://github.com/kyma-project/busola/tree/main/docs/extensibility"
          />
        </Trans>
      </MessageStrip>
    );
  };

  const ConfigMapInfo = () => {
    const bold = { fontWeight: 'bolder' };

    return (
      <MessageStrip type="information" className="fd-margin-bottom--sm">
        <Trans
          i18nKey="extensibility.starter-modal.messages.configmap-info"
          values={{ name: crd.metadata.name }}
        >
          <span style={bold} />
          <span style={bold} />
        </Trans>
      </MessageStrip>
    );
  };

  const ScaffoldOnlyInfo = () => {
    return (
      <MessageStrip type="information" className="fd-margin-top--sm">
        {t('extensibility.starter-modal.messages.scaffold-only')}
      </MessageStrip>
    );
  };

  return (
    <ModalWithForm
      title={t('extensibility.starter-modal.title', {
        kind: pluralize(prettifyKind(crd.spec.names.kind)),
      })}
      modalOpeningComponent={
        <Button glyph="add" className="fd-margin-end--tiny">
          {t('extensibility.starter-modal.buttons.open-modal')}
        </Button>
      }
      renderForm={props => (
        <>
          <DocsLink />
          <ConfigMapInfo />
          <ExtensibilityStarterForm crd={crd} {...props} />
          <ScaffoldOnlyInfo />
        </>
      )}
      className="modal-size--l"
    />
  );
}
