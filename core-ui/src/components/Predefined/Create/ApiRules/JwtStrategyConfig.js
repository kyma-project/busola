import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { FormInput } from 'fundamental-react';

/*
config:
  jwks_urls:
    - <url>
    - <url>
    ...
  trusted_issuers:
    - <issuer>
    - <issuer>
    ...
they are required to be pairs for some reason
*/
export function JwtStrategyConfig(props) {
  const { t } = useTranslation();

  const toInternal = config => {
    const l = Math.max(
      config?.jwks_urls?.length || 0,
      config?.trusted_issuers?.length || 0,
    );

    const internal = [];
    for (let i = 0; i < l; i++) {
      internal.push({
        jwksUri: config?.jwks_urls?.[i] || '',
        trustedIssuer: config?.trusted_issuers?.[i] || '',
      });
    }
    return internal;
  };

  const toExternal = array => {
    array = array.filter(v => v?.jwksUri || v?.trustedIssuer);
    return {
      jwks_urls: array.map(v => v.jwksUri),
      trusted_issuers: array.map(v => v.trustedIssuer),
    };
  };

  return (
    <ResourceForm.MultiInput
      required
      title={t('idk')}
      toInternal={toInternal}
      toExternal={toExternal}
      inputs={[
        ({ value, setValue, ref, onBlur, focus, index }) => (
          <FormInput
            key={index + '--jwksUri'}
            compact
            value={value?.jwksUri || ''}
            ref={ref}
            onChange={e => setValue({ ...value, jwksUri: e.target.value })}
            onKeyDown={e => focus(e)}
            onBlur={onBlur}
          />
        ),
        ({ value, setValue, ref, onBlur, focus, index }) => (
          <FormInput
            key={index + '--trustedIssuer'}
            compact
            value={value?.trustedIssuer || ''}
            ref={ref}
            onChange={e =>
              setValue({ ...value, trustedIssuer: e.target.value })
            }
            onKeyDown={e => focus(e)}
            onBlur={onBlur}
          />
        ),
      ]}
      {...props}
    />
  );
}
