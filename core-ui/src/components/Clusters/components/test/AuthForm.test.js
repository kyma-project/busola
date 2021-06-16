import React from 'react';
import renderer from 'react-test-renderer';

import { AuthForm, AUTH_FORM_OIDC, DEFAULT_SCOPE_VALUE } from '../AuthForm';

const DEFINED_SCOPE_VALUE = 'email openid';

const findElByInputTypeAndPropsId = (instance, propsId) =>
  instance.findAll(
    ({ type, props }) => type === 'input' && props.id === propsId,
  );

describe('AuthForm', () => {
  it('Renders Scope input with defined scope value', () => {
    const authForm = (
      <AuthForm
        setAuthValid={() => {}}
        auth={{ type: AUTH_FORM_OIDC, scope: DEFINED_SCOPE_VALUE }}
        setAuth={() => {}}
      />
    );
    const component = renderer.create(authForm).root;
    const elValue = findElByInputTypeAndPropsId(component, 'scope')[0].props
      .defaultValue;
    expect(elValue).toEqual(DEFINED_SCOPE_VALUE);
  });

  it('Renders Scope input with default scope value', () => {
    const authForm = (
      <AuthForm
        setAuthValid={() => {}}
        auth={{ type: AUTH_FORM_OIDC }}
        setAuth={() => {}}
      />
    );
    const component = renderer.create(authForm).root;
    const elValue = findElByInputTypeAndPropsId(component, 'scope')[0].props
      .defaultValue;
    expect(elValue).toEqual(DEFAULT_SCOPE_VALUE);
  });
});
