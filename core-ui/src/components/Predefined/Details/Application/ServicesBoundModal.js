import React from 'react';

import { Link } from 'fundamental-react';
import { Modal } from 'react-shared';
import ServiceListItem from './ServiceListItem';
import { useTranslation } from 'react-i18next';

export default function ServicesBoundModal({ binding, appSpec }) {
  const { t, i18n } = useTranslation();
  const namespace = binding.metadata.namespace;

  const modalOpeningComponent = <Link className="fd-link">{namespace}</Link>;

  return (
    <Modal
      confirmText={t('common.buttons.ok')}
      title={t('applications.subtitle.bound-to', {
        namespace: namespace,
      })}
      modalOpeningComponent={modalOpeningComponent}
      i18n={i18n}
    >
      <ul>
        {/* ApplicationMapping spec is empty */}
        {!binding.spec?.services?.length &&
          appSpec.services?.map(s => (
            <li key={s.id}>
              <ServiceListItem service={s} />
            </li>
          ))}
        {/* ApplicationMapping spec is not empty */}
        {binding.spec?.services?.length &&
          binding.spec?.services?.map(s => (
            <li key={s.id}>
              <ServiceListItem service={s} />
            </li>
          ))}

        {binding.spec?.services?.length && !binding.spec?.services?.length && (
          <p>{t('applications.messages.no-bound-service')}</p>
        )}
      </ul>
    </Modal>
  );
}
