import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePost } from 'react-shared';
import {
  FormRadioGroup,
  FormRadioItem,
  FormItem,
  FormLabel,
  FormInput,
} from 'fundamental-react';

import { RoleCombobox } from './RoleCombobox.js';

export const RoleBindings = ({
  formElementRef,
  onChange,
  onCompleted,
  onError,
  namespace,
  resourceUrl,
  refetchList,
}) => {
  const { t } = useTranslation();

  const [subject, setSubject] = useState('');
  const [isGroup, setGroup] = useState(false);
  const [role, setRole] = useState('');
  const [roleKind, setRoleKind] = useState('');

  const request = usePost();

  const handleFormSubmit = async e => {
    e.preventDefault();
    const name = `${subject}-${role}`;
    const params = {
      kind: namespace ? 'RoleBinding' : 'ClusterRoleBinding',
      metadata: {
        name,
      },
      roleRef: {
        kind: roleKind,
        name: role,
      },
      subjects: [
        {
          kind: isGroup ? 'Group' : 'User',
          name: subject,
        },
      ],
    };

    try {
      await request(resourceUrl, params);
      onCompleted(
        t('role-bindings.messages.created', {
          name: name,
        }),
      );
      refetchList();
    } catch (err) {
      console.warn(err);
      onError(
        t('role-bindings.errors.cannot-create'),
        `${t('common.tooltips.error')} ${err.message}`,
      );
    }
  };

  return (
    // although HTML spec assigns the role by default to a <form> element, @testing-library ignores it
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <form
      role="form"
      onChange={onChange}
      ref={formElementRef}
      onSubmit={handleFormSubmit}
      noValidate
    >
      <FormRadioGroup inline onChange={(_, item) => setGroup(item !== 'user')}>
        <FormRadioItem data="user" inputProps={{ defaultChecked: true }}>
          {t('role-bindings.labels.user')}
        </FormRadioItem>
        <FormRadioItem data="user-group">
          {t('role-bindings.labels.user-group')}
        </FormRadioItem>
      </FormRadioGroup>
      <FormItem style={{ clear: 'both' }}>
        <FormLabel required>
          {isGroup
            ? t('role-bindings.labels.user-group')
            : t('role-bindings.labels.user')}
        </FormLabel>
        <FormInput
          type="text"
          value={subject}
          placeholder={
            isGroup
              ? t('role-bindings.placeholders.user-group')
              : t('role-bindings.placeholders.user-name')
          }
          onChange={e => setSubject(e.target.value)}
          required
        />
      </FormItem>
      <FormItem>
        <FormLabel required>{t('role-bindings.labels.role')}</FormLabel>
        <RoleCombobox
          setRole={setRole}
          setRoleKind={setRoleKind}
          namespace={namespace}
        />
      </FormItem>
    </form>
  );
};
