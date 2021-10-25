import React from 'react';
import { useTranslation } from 'react-i18next';

import { FormFieldset } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { Select } from 'shared/components/Select/Select';

import { DEFAULT_APIGROUP, newSubject, SUBJECT_KINDS } from './templates';

export function SingleSubjectForm({ subject = {}, subjects, setSubjects }) {
  const { t } = useTranslation();
  console.log('subject', subject, 'subjects', subjects);
  const onKindSelect = (_, selected) => {
    // subject = newSubject(selected.key);
    subject.kind = selected.key;
    switch (subject.kind) {
      case 'Group':
        console.log();
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
        break;
    }
    // console.log('new subject', subject, newSubject(selected.key), subjects)
    setSubjects([...subjects]);
    console.log('new subjects!!', subjects);
  };
  const setName = name => {
    subject.name = name;
    setSubjects([...subjects]);
  };
  return (
    <FormFieldset>
      <ResourceForm.FormField
        required
        tooltipContent={t('role-bindings.create-modal.tooltips.kind')}
        label={t('role-bindings.create-modal.kind')}
        input={() => (
          <Select
            compact
            onSelect={onKindSelect}
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
      <ResourceForm.FormField
        required
        disabled
        label={t('role-bindings.create-modal.api-group')}
        value={subject.apiGroup || []}
        // setValue={setName}
        input={Inputs.Text}
        placeholder={t('role-bindings.placeholders.api-group')}
      />
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
      />
    </ResourceForm.CollapsibleSection>
  );
}
