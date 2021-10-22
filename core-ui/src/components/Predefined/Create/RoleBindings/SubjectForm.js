import React from 'react';
import { FormFieldset } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

export function SingleSubjectForm(props) {
  return (
    <FormFieldset>
      subject
      {/* <PortsForm {...props} />
      <TlsForm {...props} />
      <HostsForm {...props} /> */}
    </FormFieldset>
  );
}

export function SingleSubjectInput({ value: subjects, setValue: setSubjects }) {
  return (
    <ResourceForm.CollapsibleSection title="Subject" defaultOpen>
      <SingleSubjectForm
        subject={subjects?.[0]}
        subjects={subjects}
        setSubjects={setSubjects}
      />
    </ResourceForm.CollapsibleSection>
  );
}
