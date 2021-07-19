import React, { useState } from 'react';

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
      onCompleted(`Role Binding ${name} created`);
      refetchList();
    } catch (err) {
      console.warn(err);
      onError('Cannot create Role Binding', `Error: ${err.message}`);
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
          User
        </FormRadioItem>
        <FormRadioItem data="user-group">User Group</FormRadioItem>
      </FormRadioGroup>
      <FormItem style={{ clear: 'both' }}>
        <FormLabel required>{isGroup ? 'User group' : 'User name'}</FormLabel>
        <FormInput
          type="text"
          value={subject}
          placeholder={`User ${isGroup ? 'group' : 'name'}`}
          onChange={e => setSubject(e.target.value)}
          required
        />
      </FormItem>
      <FormItem>
        <FormLabel required>Role</FormLabel>
        <RoleCombobox
          setRole={setRole}
          setRoleKind={setRoleKind}
          namespace={namespace}
        />
      </FormItem>
    </form>
  );
};
