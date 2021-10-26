import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as jp from 'jsonpath';
import { createBindingTemplate, newSubject } from './templates';
import { SingleSubjectForm, SingleSubjectInput } from './SubjectForm';
import { validateBinding } from './helpers';
import { MessageStrip } from 'fundamental-react';
import { RoleForm } from './RoleForm.js';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

export function RoleBindings({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const { t } = useTranslation();

  const [binding, setBinding] = useState(createBindingTemplate(namespace));

  React.useEffect(() => {
    setCustomValid(validateBinding(binding));
  }, [binding, setCustomValid]);

  const handleNameChange = name => {
    jp.value(binding, '$.metadata.name', name);

    setBinding({ ...binding });
  };

  const resourceData = namespace
    ? {
        pluralKind: 'rolebindings',
        singularName: t(`role-bindings.name_singular`),
        createUrl: `/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/rolebindings/`,
      }
    : {
        pluralKind: 'clusterrolebindings',
        singularName: t(`cluster-role-bindings.name_singular`),
        createUrl: '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/',
      };
  return (
    <ResourceForm
      pluralKind={resourceData.pluralKind}
      singularName={resourceData.singularName}
      resource={binding}
      setResource={setBinding}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceData.createUrl}
    >
      <ResourceForm.FormField
        required
        label={t('common.labels.name')}
        placeholder={t('components.k8s-name-input.placeholder', {
          resourceType: resourceData.singularName,
        })}
        input={Inputs.Text}
        propertyPath="$.metadata.name"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <RoleForm
        binding={binding}
        setBinding={setBinding}
        namespace={namespace}
      />
      {jp.value(binding, '$.subjects.length') ? (
        <SingleSubjectInput simple propertyPath="$.subjects" />
      ) : (
        <MessageStrip simple type="warning" className="fd-margin-top--sm">
          {t('role-bindings.create-modal.at-least-one-subject-required', {
            resource: resourceData.singularName,
          })}
        </MessageStrip>
      )}
      <ResourceForm.ItemArray
        advanced
        propertyPath="$.subjects"
        listTitle={t('role-bindings.create-modal.subjects')}
        nameSingular={t('role-bindings.create-modal.subject')}
        entryTitle={subject => subject?.name}
        atLeastOneRequiredMessage={t(
          'role-bindings.create-modal.at-least-one-subject-required',
          { resource: resourceData.singularName },
        )}
        itemRenderer={(current, allValues, setAllValues, index) => (
          <SingleSubjectForm
            subject={current}
            subjects={allValues}
            setSubjects={setAllValues}
            index={index}
            advanced
          />
        )}
        newResourceTemplateFn={newSubject}
      />
    </ResourceForm>
  );
}
