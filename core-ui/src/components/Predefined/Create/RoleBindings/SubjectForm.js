import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxInput } from 'fundamental-react';
import { useGetList } from 'react-shared';

import { FormFieldset } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { Select } from 'shared/components/Select/Select';
import { ServiceAccountRef } from 'shared/components/ResourceRef/ServiceAccountRef';

import { DEFAULT_APIGROUP, SUBJECT_KINDS } from './templates';

export function SingleSubjectForm({
  subject = {},
  subjects,
  setSubjects,
  index,
}) {
  const { t } = useTranslation();

  const setKind = (_, selected) => {
    subject.kind = selected.key;
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

  const setNamespace = namespace => {
    subject.namespace = namespace;
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
  const namespacesUrl = '/api/v1/namespaces';
  const { data: namespaces } = useGetList()(namespacesUrl);

  const namespacesOptions = (namespaces || []).map(ns => ({
    key: ns.metadata.name,
    text: ns.metadata.name,
  }));

  return (
    <FormFieldset>
      <ResourceForm.FormField
        required
        tooltipContent={t('role-bindings.create-modal.tooltips.kind')}
        label={t('role-bindings.create-modal.kind')}
        input={() => (
          <Select
            compact
            onSelect={setKind}
            selectedKey={subject.kind || ''}
            options={SUBJECT_KINDS.map(kind => ({
              key: kind,
              text: kind,
            }))}
            fullWidth
          />
        )}
      />

      {subject.kind === 'User' && (
        <ResourceForm.FormField
          required
          label={t('role-bindings.create-modal.user-name')}
          value={subject.name || []}
          setValue={setName}
          input={Inputs.Text}
          placeholder={t('role-bindings.placeholders.user.name')}
        />
      )}

      {subject.kind === 'Group' && (
        <ResourceForm.FormField
          required
          label={t('role-bindings.create-modal.group-name')}
          value={subject.name || []}
          setValue={setName}
          input={Inputs.Text}
          placeholder={t('role-bindings.placeholders.group.name')}
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
          advanced
          title={t('service-accounts.service-account')}
          value={{
            name: subject.name || '',
            namespace: subject.namespace || '',
          }}
          setValue={setServiceAccount}
          index={index}
        />
      )}
    </FormFieldset>
  );
}

export function SingleSubjectInput({ value: subjects, setValue: setSubjects }) {
  const { t } = useTranslation();
  return (
    <ResourceForm.CollapsibleSection
      title={t('role-bindings.create-modal.subject')}
      defaultOpen
    >
      <SingleSubjectForm
        subject={subjects?.[0]}
        subjects={subjects}
        setSubjects={setSubjects}
        index={0}
      />
    </ResourceForm.CollapsibleSection>
  );
}
