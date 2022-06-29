import { useTranslation } from 'react-i18next';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useRelationsContext } from '../contexts/RelationsContext';
import { Widget } from './Widget';

// receives { data, loading, error }, displays loading or error state and passes the value down
export function PendingWrapper({ value, ...props }) {
  const { t } = useTranslation();

  const { getRelatedResourceInPath } = useRelationsContext();

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
    // copy props to make sure original "structure" is not lost
    const copiedProps = JSON.parse(JSON.stringify(props));
    copiedProps.structure.path = props.structure.path.replace(
      relatedResourcePath,
      '',
    );
    return <Widget value={data} {...copiedProps} />;
  }
}
