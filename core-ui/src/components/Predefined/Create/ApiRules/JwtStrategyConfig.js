import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput } from 'fundamental-react';
import { MultiInput } from 'shared/ResourceForm/fields';

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
    const count = Math.max(
      config?.jwks_urls?.length || 0,
      config?.trusted_issuers?.length || 0,
    );

    const internal = [];
    for (let i = 0; i < count; i++) {
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
    <MultiInput
      required
      title={t('api-rules.jwt.idp-presets')}
      toInternal={toInternal}
      toExternal={toExternal}
      inputs={[
        ({ value, setValue, ref, onBlur, focus, index }) => (
          <FormInput
            key={index + '--jwksUri'}
            compact
            type="url"
            value={value?.jwksUri || ''}
            ref={ref}
            onChange={e => setValue({ ...value, jwksUri: e.target.value })}
            onKeyDown={e => focus(e)}
            onBlur={onBlur}
            placeholder={t('api-rules.jwt.jwks-uri')}
          />
        ),
        ({ value, setValue, ref, onBlur, focus, index }) => (
          <FormInput
            key={index + '--trustedIssuer'}
            compact
            type="url"
            value={value?.trustedIssuer || ''}
            ref={ref}
            onChange={e =>
              setValue({ ...value, trustedIssuer: e.target.value })
            }
            onKeyDown={e => focus(e)}
            onBlur={onBlur}
            placeholder={t('api-rules.jwt.trusted-issuer')}
          />
        ),
      ]}
      {...props}
    />
  );
}
