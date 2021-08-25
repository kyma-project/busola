import React from 'react';
import { render } from '@testing-library/react';

import { AuthForm, AUTH_FORM_OIDC, DEFAULT_SCOPE_VALUE } from '../AuthForm';

const DEFINED_SCOPE_VALUE = 'email openid';

describe('AuthForm', () => {
  it('Renders Scope input with defined scope value', () => {
    const authForm = (
      <AuthForm
        setAuthValid={() => {}}
        auth={{ type: AUTH_FORM_OIDC, scope: DEFINED_SCOPE_VALUE }}
        setAuth={() => {}}
      />
    );
    const { getByPlaceholderText } = render(authForm);
    expect(getByPlaceholderText('Scopes').value).toEqual(DEFINED_SCOPE_VALUE);
  });

  it('Renders Scope input with default scope value', () => {
    const authForm = (
      <AuthForm
        setAuthValid={() => {}}
        auth={{ type: AUTH_FORM_OIDC }}
        setAuth={() => {}}
      />
    );
    const { getByPlaceholderText } = render(authForm);
    expect(getByPlaceholderText('Scopes').value).toEqual(DEFAULT_SCOPE_VALUE);
  });
});
