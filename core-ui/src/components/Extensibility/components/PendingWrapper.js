import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { Spinner } from 'shared/components/Spinner/Spinner';

import { DataSourcesContext } from '../contexts/DataSources';
import { Widget } from './Widget';

// receives { data, loading, error }, displays loading or error state and passes the value down
export function PendingWrapper({ value, ...props }) {
  const { t } = useTranslation();

  const { getRelatedResourceInPath } = useContext(DataSourcesContext);

  if (typeof value !== 'object') {
    return value ?? null;
  }
  const { data, loading, error } = value;

  if (loading) {
    return <Spinner size="s" className="" center={false} />;
  } else if (error) {
    return t('common.messages.error', { error });
  } else {
    const relatedResourcePath = getRelatedResourceInPath(props.structure.path);

    return (
      <Widget
        value={data}
        {...props}
        structure={{
          ...props.structure,
          path: props.structure.path.replace(relatedResourcePath, ''),
        }}
      />
    );
  }
}
