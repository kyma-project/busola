import React from 'react';

import { Link } from 'fundamental-react';
import { Modal } from 'react-shared';
import ServiceListItem from './ServiceListItem';

export default function ServicesBoundModal({ binding }) {
  const namespace = binding.metadata.namespace;

  const modalOpeningComponent = <Link className="fd-link">{namespace}</Link>;

  return (
    <Modal
      confirmText="OK"
      title={`Services and Events bound to '${namespace}'`}
      modalOpeningComponent={modalOpeningComponent}
    >
      <ul>
        {binding.spec.services?.map(s => (
          <li key={s.id}>
            <ServiceListItem service={s} />
          </li>
        ))}
        {!binding.spec.services?.length && <p>No bound services found.</p>}
      </ul>
    </Modal>
  );
}
