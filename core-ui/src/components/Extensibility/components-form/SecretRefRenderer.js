import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiInput } from 'shared/ResourceForm/fields';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { useGetList, useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { Spinner } from 'shared/components/Spinner/Spinner';

export function SecretRefRender({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  ...props
}) {
  const { t } = useTranslation();
  const [namespace, setNamespace] = useState('');

  const { data: namespaces, loading: loadingNamespaces } = useGetList()(
    `/api/v1/namespaces`,
    {
      pollingInterval: 7000,
    },
  );

  const namespaceNames = (namespaces || [])
    .map(el => el.metadata.name)
    .map(n => ({ key: n, text: n }));

  const fetch = useSingleGet();

  const [fetchedSecrets, setFetchedSecrets] = useState([]);

  const fetchSecrets = namespace => {
    fetch(`/api/v1/namespaces/${namespace}/secrets`)
      .then(res => res.json())
      .then(data => {
        //add to ref
        setFetchedSecrets(prevState => ({
          ...prevState,
          [namespace]: (data.items || [])
            .map(el => el.metadata.name)
            .map(n => ({ key: n, text: n })),
        }));
      })
      .catch(err => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (Array.isArray(value)) {
      value.forEach(el => {
        if (!fetchedSecrets[namespace]) {
          fetchSecrets(el.namespace);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (loadingNamespaces) {
    return <Spinner />;
  }

  return (
    <MultiInput
      toInternal={value => {
        return Array.isArray(value) ? value : [];
      }}
      toExternal={value => {
        return value.filter(el => !!el);
      }}
      value={value}
      setValue={value => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value },
        });
      }}
      className="secret-ref-form"
      title={t('btp-service-bindings.parameters-from')}
      sectionTooltipContent={t('btp-service-bindings.tooltips.parameters-from')}
      inputs={[
        ({ value, setValue, ref, updateValue, focus }) => (
          <Dropdown
            compact
            options={namespaceNames}
            selectedKey={value?.namespace}
            ref={ref}
            onSelect={(e, selected) => {
              setNamespace(selected.key);
              setValue({ namespace: selected.key });
              updateValue();
              focus(e);
              //fetch secrets list
              fetchSecrets(selected.key);
            }}
            placeholder={t('extensibility.secret-ref.select-namespace')}
          />
        ),
        ({ value, setValue, ref, updateValue, focus }) =>
          value?.namespace ? (
            <Dropdown
              compact
              // className="secret-key-dropdown"
              options={fetchedSecrets[value.namespace]}
              selectedKey={value.name}
              onSelect={(e, selected) => {
                setValue({ ...value, name: selected.key });
                updateValue();
                focus(e);
              }}
              placeholder={t('extensibility.secret-ref.select-secret')}
              emptyListMessage={t(
                'extensibility.secret-ref.namespace-no-secrets',
              )}
            />
          ) : (
            <Dropdown
              compact
              disabled
              placeholder={t(
                'btp-service-bindings.placeholder.choose-secret-first',
              )}
            />
          ),
      ]}
    />
  );
}
