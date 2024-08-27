import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { Select, Option } from '@ui5/webcomponents-react';
import { ServiceAccountRef } from 'shared/components/ResourceRef/ServiceAccountRef';

import { DEFAULT_APIGROUP, SUBJECT_KINDS } from './templates';

export function SingleSubjectForm({
  subject = {},
  subjects,
  setSubjects,
  index,
  nestingLevel = 0,
}) {
  const { t } = useTranslation();

  const setKind = selected => {
    subject.kind = selected;
    switch (subject.kind) {
      case 'Group':
        delete subject.namespace;
        subject.name = '';
        subject.apiGroup = DEFAULT_APIGROUP;
        break;
      case 'ServiceAccount':
        delete subject.apiGroup;
        subject.name = '';
        subject.namespace = '';
        break;
      case 'User':
      default:
        delete subject.namespace;
        subject.name = '';
        subject.apiGroup = DEFAULT_APIGROUP;
    }
    setSubjects([...subjects]);
  };

  const setName = name => {
    subject.name = name;
    setSubjects([...subjects]);
  };

  const setServiceAccount = ({ name, namespace }) => {
    if (name) {
      subject.name = name;
    }
    if (namespace) {
      subject.namespace = namespace;
    }
    setSubjects([...subjects]);
  };

  const onChange = event => {
    const selectedKind = event.detail.selectedOption.value;
    setKind(selectedKind);
  };

  return (
    <div>
      <ResourceForm.FormField
        required
        tooltipContent={t('role-bindings.create-modal.tooltips.kind')}
        label={t('role-bindings.create-modal.kind')}
        input={() => (
          <Select onChange={onChange} className="bsl-col-md--12">
            {SUBJECT_KINDS.map(kind => (
              <Option value={kind} selected={(subject.kind || '') === kind}>
                {kind}
              </Option>
            ))}
          </Select>
        )}
      />

      {subject.kind === 'User' && (
        <ResourceForm.FormField
          required
          label={t('role-bindings.create-modal.user-name')}
          value={subject.name || []}
          setValue={setName}
          input={Inputs.Text}
          aria-label={t('role-bindings.create-modal.user-name')}
        />
      )}

      {subject.kind === 'Group' && (
        <ResourceForm.FormField
          required
          label={t('role-bindings.create-modal.group-name')}
          value={subject.name || []}
          setValue={setName}
          input={Inputs.Text}
          aria-label={t('role-bindings.create-modal.group-name')}
        />
      )}

      {(subject.kind === 'Group' || subject.kind === 'User') && (
        <ResourceForm.FormField
          required
          disabled
          label={t('role-bindings.create-modal.api-group')}
          value={subject.apiGroup || []}
          input={Inputs.Text}
          placeholder={t('role-bindings.placeholders.api-group')}
        />
      )}

      {subject.kind === 'ServiceAccount' && (
        <ServiceAccountRef
          title={t('service-accounts.service-account')}
          value={{
            name: subject.name || '',
            namespace: subject.namespace || '',
          }}
          setValue={setServiceAccount}
          index={index}
          nestingLevel={nestingLevel + 1}
        />
      )}
    </div>
  );
}
